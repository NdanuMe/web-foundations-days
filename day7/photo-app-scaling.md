# SnapShare Scaling Plan

## 1. Assumptions

- 10 million registered users.
- 10% are active each day, so **daily active users (DAU) = 10,000,000 × 0.10 = 1,000,000**.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- An average photo is 2 MB, and each photo also gets a 50 KB thumbnail.
- One day has 86,400 seconds.
- Peak traffic is 5× the average.

## 2. Estimates

### Uploads per second
- Uploads per day: 1,000,000 × 1 = 1,000,000
- Average: 1,000,000 / 86,400 ≈ **12 uploads per second**
- Peak (5×): ≈ **58 uploads per second**

### Feed views per second
- Feed views per day: 1,000,000 × 50 = 50,000,000
- Average: 50,000,000 / 86,400 ≈ **579 views per second**
- Peak (5×): ≈ **2,900 views per second**

### Storage per year
- Original photos per day: 1,000,000 × 2 MB = 2 TB
- Thumbnails per day: 1,000,000 × 50 KB = 50 GB
- Per year, originals: 2 TB × 365 = **730 TB**
- Per year, thumbnails: 0.05 TB × 365 ≈ **18 TB**
- Total: about **748 TB per year (roughly 0.75 PB)**

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy**. There are about 50 feed views for every 1 upload (50,000,000 reads against 1,000,000 writes per day), a ratio of roughly 50:1.

What this means for the design:
- Optimise for fast reads: cache feeds and metadata, serve photos from a CDN, and add database read replicas.
- Writes are fewer, so they can be slower and handled in the background (for example, thumbnail creation through a queue).

## 4. Why photos do not go in the database

Photos are large binary files (2 MB each, about 730 TB per year). Storing them in the database would make it huge, slow to back up and expensive to scale, and every photo read would compete with normal queries. Instead, the photo files go in **object storage** (such as Amazon S3), which is cheap, built for large files and easy to scale. The database stores only the **metadata**: the photo id, owner, caption, time and the URL of the file in object storage.

## 5. Architecture diagram

```
                      +---------+
                      |  Users  |
                      +----+----+
                           |
              +------------+-------------+
              |                          |
      (photos, thumbnails)         (API requests)
              |                          |
         +----v----+             +-------v--------+
         |   CDN   |             | Load Balancer  |
         +----+----+             +-------+--------+
              |                          |
              |                +---------+---------+
              |                |                   |
              |          +-----v-----+       +-----v-----+
              |          | App Server|       | App Server|
              |          +-----+-----+       +-----+-----+
              |                |                   |
              |        +-------+-------+-----------+
              |        |       |       |
              |   +----v--+ +--v-----------+   +-----------+
              |   | Cache | |   Database   |-->| Read      |
              |   |(Redis)| |  (primary)   |   | Replica   |
              |   +-------+ +--------------+   +-----------+
              |                |
              |      (upload)  |  (job message)
              |        |       +------------+
     +--------v--------v--+             +---v-----+      +--------+
     |   Object Storage   |<------------|  Queue  |----->| Worker |
     |  (photos + thumbs) |  read/write +---------+      |(thumbs)|
     +--------------------+                              +--------+
```

## 6. What each component does

- **CDN:** serves photos and thumbnails from servers close to the user, so images load fast and the origin is not overloaded.
- **Load balancer:** spreads incoming requests across several app servers so no single server is overwhelmed and one failure does not take the app down.
- **App servers:** run the application logic (login, upload, feed) and can be added or removed as traffic changes.
- **Cache:** keeps frequently requested data (such as popular feeds) in memory, so the database is asked far less often.
- **Database with a read replica:** the primary stores users, follows and photo metadata, while the replica handles read queries to take load off the primary.
- **Object storage:** holds the large photo and thumbnail files cheaply and reliably, keeping them out of the database.
- **Queue:** holds thumbnail jobs so the upload request can finish quickly without waiting for the image to be processed.
- **Worker:** picks jobs off the queue and creates the thumbnails in the background, and more workers can be added if the queue grows.

## 7. Upload flow, step by step

1. The user selects a photo in the app and taps Upload.
2. The request reaches the **load balancer**, which sends it to one **app server**.
3. The app server checks that the user is logged in and that the file is valid (type and size).
4. The app server saves the original photo file to **object storage** and gets back its URL.
5. The app server saves the photo's metadata (id, owner, URL, time) in the **database**.
6. The app server puts a "create thumbnail" message on the **queue**.
7. The app server replies "Upload successful" to the user straight away.
8. A **worker** takes the message from the queue, reads the original from object storage, and creates the 50 KB thumbnail.
9. The worker saves the thumbnail to object storage and updates the photo's metadata with the thumbnail URL.
10. The affected feed entries in the **cache** are invalidated or updated, so followers see the new photo.
11. When followers load their feed, the thumbnail and photo are delivered through the **CDN**.

## 8. Trade-offs

- **Cache speed vs fresh data:** the cache makes feeds much faster, but a follower may see an out-of-date feed for a short time after someone uploads. A shorter cache time gives fresher data but sends more load to the database.
- **Read replica speed vs consistency:** replicas spread the read load, but they copy data from the primary with a small delay (replication lag). A user might upload a photo and not see it immediately if their read goes to a replica that has not caught up.
- **Queue and worker (speed vs delay):** uploads feel fast because thumbnails are made in the background, but for a few seconds the thumbnail may not exist yet. The app needs a fallback, such as showing a placeholder.
- **Cost vs performance:** a CDN and extra servers cost money. With about 748 TB of new storage each year, the team must decide how long to keep original photos and whether to move old photos to cheaper storage.
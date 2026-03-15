-- ============================================================
-- Auto-create all databases needed by EduPlatform micro-services
-- This file is mounted into the MySQL container at
--   /docker-entrypoint-initdb.d/init.sql
-- and runs ONCE on the very first startup (when the data volume
-- is empty).
-- ============================================================

CREATE DATABASE IF NOT EXISTS `Service_user`   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `course_db`      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `lesson_db`      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `Servicethongke`  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `vnpay_db`       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

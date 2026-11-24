CREATE DATABASE IF NOT EXISTS novaverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE novaverse;

CREATE TABLE IF NOT EXISTS reactions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    body_name VARCHAR(50) NOT NULL UNIQUE,
    likes INT UNSIGNED NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS visitors (
    id INT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
    total_visits INT UNSIGNED NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO reactions (body_name, likes) VALUES
('novaprime', 128),
('ember', 42),
('azure', 57),
('verdant', 49),
('frost', 33),
('lunaone', 64),
('lunatwo', 41),
('lunathree', 38)
ON DUPLICATE KEY UPDATE likes = VALUES(likes);

INSERT INTO visitors (id, total_visits) VALUES (1, 1247)
ON DUPLICATE KEY UPDATE total_visits = VALUES(total_visits);

CREATE DATABASE IF NOT EXISTS serviceflow_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS serviceflow_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'serviceflow'@'localhost' IDENTIFIED BY 'serviceflow123';

GRANT ALL PRIVILEGES ON serviceflow_dev.* TO 'serviceflow'@'localhost';
GRANT ALL PRIVILEGES ON serviceflow_test.* TO 'serviceflow'@'localhost';

FLUSH PRIVILEGES;

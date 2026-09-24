-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 24, 2026 at 12:00 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `user_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `lyrics`
--

CREATE TABLE `lyrics` (
  `id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `lyrics` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lyrics`
--

INSERT INTO `lyrics` (`id`, `title`, `author`, `lyrics`) VALUES
(3, 'Off-mic', 'Joyce', 'Off mic si joyce\nwala si lloyd\nwala din si emman\ntahimik ni luis'),
(4, 'Off mic', 'Luis', 'Naka off mic[G] si luis\nDi nagsa[C]salita si Lloyd\nMay sariling [Em]mundo silang dalawa'),
(5, 'GG', 'Lloyd', '1st Line\n2nd Line\n3rd Line');

-- --------------------------------------------------------

--
-- Table structure for table `setlists`
--

CREATE TABLE `setlists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `setlists`
--

INSERT INTO `setlists` (`id`, `user_id`, `name`, `created_at`, `updated_at`) VALUES
(14, 4, 'ggg', '2026-09-24 02:54:45', '2026-09-24 02:54:45');

-- --------------------------------------------------------

--
-- Table structure for table `setlist_songs`
--

CREATE TABLE `setlist_songs` (
  `setlist_id` int(11) NOT NULL,
  `song_id` int(11) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `setlist_songs`
--

INSERT INTO `setlist_songs` (`setlist_id`, `song_id`, `position`) VALUES
(2, 1, 0),
(2, 4, 1),
(5, 3, 2),
(14, 3, 2),
(14, 4, 1),
(14, 5, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Singer','Musician') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`) VALUES
(1, 'jlloyd01@jggmmd.com', 'jlloyd01@jggmmd.com', '$2y$10$bihAI352pd9MOQN18mwx4OsuDk1m3XhvrbNgUM4khKaR8LB/Mqpw.', 'Musician'),
(2, 'davezyrus004', 'davezyrus1234@jggmmd.com', '$2y$10$oCRSqZElWoBg8nG1jJh3u.88.0xLzHhpJ6MilgCyw5qIHNA06KZIO', 'Musician'),
(3, '123', 'jlloyd01jg@g.c', '$2y$10$sUzgAbDj03MuOYoGJFJtIOkVZEh98caDlHhxhSsgiAvFE2AeHgg7K', 'Musician'),
(4, 'singer', 'singer@jggmmd.com', '$2y$10$yiURytqFcAVkYmTicgWHdeJXQ6AYyeRbKh4svw1SZFYFRw74AQVqy', 'Singer');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lyrics`
--
ALTER TABLE `lyrics`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `setlists`
--
ALTER TABLE `setlists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `setlist_songs`
--
ALTER TABLE `setlist_songs`
  ADD PRIMARY KEY (`setlist_id`,`song_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lyrics`
--
ALTER TABLE `lyrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `setlists`
--
ALTER TABLE `setlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

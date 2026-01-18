-- Food Donation and Surplus Management System Database Schema
-- MySQL Script to create all necessary tables

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('DONOR', 'RECEIVER', 'ADMIN', 'VERIFIED_VOLUNTEER') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  profile_image_url VARCHAR(500),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  organization_type ENUM('NGO', 'CHARITY', 'RESTAURANT', 'HOTEL', 'INDIVIDUAL', 'EVENT_ORGANIZER') NOT NULL,
  description TEXT,
  registration_number VARCHAR(100),
  website VARCHAR(500),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10),
  verification_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  verified_by INT,
  verified_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  registration_document_url VARCHAR(500),
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_organization_type (organization_type),
  INDEX idx_verification_status (verification_status),
  INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Donations table
CREATE TABLE IF NOT EXISTS donations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  donor_id INT NOT NULL,
  organization_id INT,
  food_type VARCHAR(100) NOT NULL,
  food_category ENUM('COOKED', 'RAW', 'PACKAGED', 'BEVERAGES', 'DAIRY', 'BAKERY', 'FRUITS', 'VEGETABLES') NOT NULL,
  quantity INT NOT NULL,
  unit ENUM('KG', 'LITER', 'PIECES', 'DOZEN', 'BOXES') DEFAULT 'KG',
  description TEXT,
  preparation_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  storage_condition VARCHAR(100),
  location_latitude DECIMAL(10, 8) NOT NULL,
  location_longitude DECIMAL(11, 8) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255),
  image_url VARCHAR(500),
  status ENUM('AVAILABLE', 'REQUESTED', 'ALLOCATED', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'EXPIRED') DEFAULT 'AVAILABLE',
  availability_count INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_status (status),
  INDEX idx_city (city),
  INDEX idx_expiry_date (expiry_date),
  INDEX idx_donor_id (donor_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Pickup Requests table
CREATE TABLE IF NOT EXISTS pickup_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  donation_id INT NOT NULL,
  receiver_id INT NOT NULL,
  organization_id INT NOT NULL,
  requested_quantity INT NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED', 'REJECTED') DEFAULT 'PENDING',
  pickup_date DATE,
  pickup_time TIME,
  special_instructions TEXT,
  rejection_reason VARCHAR(500),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_status (status),
  INDEX idx_donation_id (donation_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  type ENUM('DONATION_AVAILABLE', 'REQUEST_RECEIVED', 'PICKUP_CONFIRMED', 'DONATION_PICKED', 'RATING_RECEIVED', 'ORGANIZATION_APPROVED', 'ORGANIZATION_REJECTED', 'NEW_MESSAGE') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_id INT,
  related_entity_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  related_donation_id INT,
  related_request_id INT,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (related_donation_id) REFERENCES donations(id),
  FOREIGN KEY (related_request_id) REFERENCES pickup_requests(id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  rater_id INT NOT NULL,
  rated_user_id INT NOT NULL,
  donation_id INT,
  request_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rater_id) REFERENCES users(id),
  FOREIGN KEY (rated_user_id) REFERENCES users(id),
  FOREIGN KEY (donation_id) REFERENCES donations(id),
  FOREIGN KEY (request_id) REFERENCES pickup_requests(id),
  INDEX idx_rated_user_id (rated_user_id),
  INDEX idx_rater_id (rater_id),
  INDEX idx_donation_id (donation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  total_donations_count INT DEFAULT 0,
  total_pickups_count INT DEFAULT 0,
  total_food_quantity_kg DECIMAL(15, 2) DEFAULT 0,
  people_helped_count INT DEFAULT 0,
  active_donors_count INT DEFAULT 0,
  active_receivers_count INT DEFAULT 0,
  active_organizations_count INT DEFAULT 0,
  food_saved_from_waste_kg DECIMAL(15, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date (date),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create User Verification Tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  type ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_type (type),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  changes JSON,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add database creation statement for initial setup
CREATE DATABASE IF NOT EXISTS food_donation_db;

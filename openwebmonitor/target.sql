/*
 Navicat Premium Data Transfer

 Source Server         : openwebmonitor
 Source Server Type    : SQLite
 Source Server Version : 3012001
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3012001
 File Encoding         : 65001

 Date: 18/03/2018 16:15:53
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for target
-- ----------------------------
DROP TABLE IF EXISTS "target";
CREATE TABLE "target" (
  "id" text,
  "address" text,
  "name" text,
  "state" integer,
  "topindex" integer,
  "icon" text,
  "min_change" integer,
  "min_text_line" integer,
  "read" integer,
  "muted" integer,
  "way" integer DEFAULT 0,
  "added_only" integer DEFAULT 0
);

PRAGMA foreign_keys = true;

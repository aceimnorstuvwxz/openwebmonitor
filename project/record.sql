/*
 Navicat Premium Data Transfer

 Source Server         : openwebmonitor
 Source Server Type    : SQLite
 Source Server Version : 3012001
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3012001
 File Encoding         : 65001

 Date: 18/03/2018 16:16:00
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for record
-- ----------------------------
DROP TABLE IF EXISTS "record";
CREATE TABLE "record" (
  "id" text,
  "target_id" text,
  "html" text,
  "read" integer,
  "flag" integer,
  "time" integer,
  "number" integer,
  "state" integer,
  "status" text,
  "added" integer,
  "deleted" integer,
  "diff" text
);

-- ----------------------------
-- Indexes structure for table record
-- ----------------------------
CREATE INDEX "main"."record-number"
ON "record" (
  "number" COLLATE BINARY DESC
);

PRAGMA foreign_keys = true;

CC = gcc
CFLAGS = -Wall -Wextra

all: pc_clicker_server

pc_clicker_server: backend/server.c
	$(CC) $(CFLAGS) -o backend/pc_clicker_server backen

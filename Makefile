CC = gcc
CFLAGS = -Wall -Wextra -Wformat

# Define target executable with proper path (with .exe extension for Windows)
SERVER_EXECUTABLE = backend/pc_clicker_server.exe

# Default target that depends on the server executable
all: $(SERVER_EXECUTABLE)

# Rule to build the server executable
$(SERVER_EXECUTABLE): backend/server.c
	@if not exist backend mkdir backend
	@if not exist database mkdir database
	$(CC) $(CFLAGS) -o $@ $<

# Run the server (for testing)
run: $(SERVER_EXECUTABLE)
	$(SERVER_EXECUTABLE) create testuser

# Clean target to remove generated files
clean:
	@if exist $(SERVER_EXECUTABLE) del /Q $(SERVER_EXECUTABLE)

# Ensure the executable is marked as phony to always check if it needs rebuilding
.PHONY: all clean backend_dir database_dir

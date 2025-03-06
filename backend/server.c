#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define MAX_PLAYERS 100
#define MAX_LINE_LENGTH 1024
#define DATA_FILE "database/players.txt"
#define LEADERBOARD_FILE "database/leaderboard.txt"

typedef struct {
    char username[50];
    long long pcs;
    int click_value;
    int pcs_per_second;
    int total_clicks;
    long long total_pcs;
    int upgrades[6];
    time_t last_save;
} Player;

// Function to save player data to file
void save_player(Player player) {
    FILE *file = fopen(DATA_FILE, "a+");
    if (file == NULL) {
        printf("Content-Type: application/json\n\n");
        printf("{\"status\":\"error\",\"message\":\"Cannot open data file\"}\n");
        return;
    }

    // Check if player already exists
    char line[MAX_LINE_LENGTH];
    FILE *temp = fopen("database/temp.txt", "w");
    int found = 0;

    while (fgets(line, MAX_LINE_LENGTH, file)) {
        char existing_username[50];
        sscanf(line, "%[^,]", existing_username);
        
        if (strcmp(existing_username, player.username) == 0) {
            // Write updated player data
            fprintf(temp, "%s,%lld,%d,%d,%d,%lld,%d,%d,%d,%d,%d,%d,%ld\n", 
                    player.username, player.pcs, player.click_value,
                    player.pcs_per_second, player.total_clicks, player.total_pcs,
                    player.upgrades[0], player.upgrades[1], player.upgrades[2],
                    player.upgrades[3], player.upgrades[4], player.upgrades[5],
                    player.last_save);
            found = 1;
        } else {
            fprintf(temp, "%s", line);
        }
    }

    if (!found) {
        // Add new player
        fprintf(temp, "%s,%lld,%d,%d,%d,%lld,%d,%d,%d,%d,%d,%d,%ld\n", 
                player.username, player.pcs, player.click_value,
                player.pcs_per_second, player.total_clicks, player.total_pcs,
                player.upgrades[0], player.upgrades[1], player.upgrades[2],
                player.upgrades[3], player.upgrades[4], player.upgrades[5],
                player.last_save);
    }

    fclose(file);
    fclose(temp);

    // Replace original file with temp file
    remove(DATA_FILE);
    rename("database/temp.txt", DATA_FILE);

    printf("Content-Type: application/json\n\n");
    printf("{\"status\":\"success\",\"message\":\"Player data saved\"}\n");
}

// Function to load player data from file
void load_player(const char *username) {
    FILE *file = fopen(DATA_FILE, "r");
    if (file == NULL) {
        printf("Content-Type: application/json\n\n");
        printf("{\"status\":\"error\",\"message\":\"Cannot open data file\"}\n");
        return;
    }

    char line[MAX_LINE_LENGTH];
    int found = 0;

    while (fgets(line, MAX_LINE_LENGTH, file)) {
        char existing_username[50];
        sscanf(line, "%[^,]", existing_username);
        
        if (strcmp(existing_username, username) == 0) {
            Player player;
            sscanf(line, "%[^,],%lld,%d,%d,%d,%lld,%d,%d,%d,%d,%d,%d,%ld", 
                   player.username, &player.pcs, &player.click_value,
                   &player.pcs_per_second, &player.total_clicks, &player.total_pcs,
                   &player.upgrades[0], &player.upgrades[1], &player.upgrades[2],
                   &player.upgrades[3], &player.upgrades[4], &player.upgrades[5],
                   &player.last_save);
            
            printf("Content-Type: application/json\n\n");
            printf("{\"status\":\"success\",\"data\":{\"username\":\"%s\",\"pcs\":%lld,\"clickValue\":%d,\"pcsPerSecond\":%d,\"totalClicks\":%d,\"totalPcs\":%lld,\"upgrades\":[%d,%d,%d,%d,%d,%d],\"lastSave\":%ld}}\n",
                   player.username, player.pcs, player.click_value,
                   player.pcs_per_second, player.total_clicks, player.total_pcs,
                   player.upgrades[0], player.upgrades[1], player.upgrades[2],
                   player.upgrades[3], player.upgrades[4], player.upgrades[5],
                   player.last_save);
            
            found = 1;
            break;
        }
    }

    fclose(file);

    if (!found) {
        printf("Content-Type: application/json\n\n");
        printf("{\"status\":\"error\",\"message\":\"Player not found\"}\n");
    }
}

// Function to update leaderboard
void update_leaderboard(const char *username, long long score) {
    FILE *file = fopen(LEADERBOARD_FILE, "r");
    Player leaderboard[MAX_PLAYERS];
    int count = 0;
    int found = 0;

    if (file != NULL) {
        char line[MAX_LINE_LENGTH];
        while (fgets(line, MAX_LINE_LENGTH, file) && count < MAX_PLAYERS) {
            char existing_username[50];
            long long existing_score;
            sscanf(line, "%[^,],%lld", existing_username, &existing_score);
            
            strcpy(leaderboard[count].username, existing_username);
            leaderboard[count].total_pcs = existing_score;
            
            if (strcmp(existing_username, username) == 0) {
                found = 1;
                if (score > existing_score) {
                    leaderboard[count].total_pcs = score;
                }
            }
            
            count++;
        }
        fclose(file);
    }

    // Add new player if not found
    if (!found && count < MAX_PLAYERS) {
        strcpy(leaderboard[count].username, username);
        leaderboard[count].total_pcs = score;
        count++;
    }

    // Sort leaderboard by score
    for (int i = 0; i < count - 1; i++) {
        for (int j = 0; j < count - i - 1; j++) {
            if (leaderboard[j].total_pcs < leaderboard[j + 1].total_pcs) {
                Player temp = leaderboard[j];
                leaderboard[j] = leaderboard[j + 1];
                leaderboard[j + 1] = temp;
            }
        }
    }

    // Write sorted leaderboard back to file
    file = fopen(LEADERBOARD_FILE, "w");
    if (file == NULL) {
        printf("Content-Type: application/json\n\n");
        printf("{\"status\":\"error\",\"message\":\"Cannot open leaderboard file\"}\n");
        return;
    }

    for (int i = 0; i < count; i++) {
        fprintf(file, "%s,%lld\n", leaderboard[i].username, leaderboard[i].total_pcs);
    }

    fclose(file);
}

// Function to get leaderboard
void get_leaderboard() {
    FILE *file = fopen(LEADERBOARD_FILE, "r");
    if (file == NULL) {
        printf("Content-Type: application/json\n\n");
        printf("{\"status\":\"error\",\"message\":\"Cannot open leaderboard file\"}\n");
        return;
    }

    printf("Content-Type: application/json\n\n");
    printf("{\"status\":\"success\",\"data\":[");

    char line[MAX_LINE_LENGTH];
    int first = 1;
    int count = 0;

    while (fgets(line, MAX_LINE_LENGTH, file) && count < 10) {
        char username[50];
        long long score;
        sscanf(line, "%[^,],%lld", username, &score);
        
        if (!first) {
            printf(",");
        }
        
        printf("{\"username\":\"%s\",\"score\":%lld}", username, score);
        first = 0;
        count++;
    }

    printf("]}\n");
    fclose(file);
}

// Function to create a new player
void create_player(const char *username) {
    Player player;
    strcpy(player.username, username);
    player.pcs = 0;
    player.click_value = 1;
    player.pcs_per_second = 0;
    player.total_clicks = 0;
    player.total_pcs = 0;
    for (int i = 0; i < 6; i++) {
        player.upgrades[i] = 0;
    }
    player.last_save = time(NULL);

    save_player(player);
}

// Main function to handle different requests
int main(int argc, char *argv[]) {
    char *request_method = getenv("REQUEST_METHOD");
    char *query_string = getenv("QUERY_STRING");

    // Create directories if they don't exist
    system("mkdir -p database");

    if (request_method == NULL) {
        // For command line testing
        if (argc < 2) {
            printf("Usage: %s <action> [username] [data]\n", argv[0]);
            return 1;
        }

        char *action = argv[1];
        
        if (strcmp(action, "create") == 0 && argc >= 3) {
            create_player(argv[2]);
        } else if (strcmp(action, "load") == 0 && argc >= 3) {
            load_player(argv[2]);
        } else if (strcmp(action, "leaderboard") == 0) {
            get_leaderboard();
        } else if (strcmp(action, "save") == 0 && argc >= 9) {
            Player player;
            strcpy(player.username, argv[2]);
            player.pcs = atoll(argv[3]);
            player.click_value = atoi(argv[4]);
            player.pcs_per_second = atoi(argv[5]);
            player.total_clicks = atoi(argv[6]);
            player.total_pcs = atoll(argv[7]);
            // Parse upgrades
            char *upgrades = argv[8];
            char *token = strtok(upgrades, ",");
            int i = 0;
            while (token != NULL && i < 6) {
                player.upgrades[i] = atoi(token);
                token = strtok(NULL, ",");
                i++;
            }
            player.last_save = time(NULL);
            
            save_player(player);
            update_leaderboard(player.username, player.total_pcs);
        }
    } else {
        // Handle CGI requests
        char action[20] = {0};
        char username[50] = {0};
        char data[1024] = {0};

        if (query_string != NULL) {
            sscanf(query_string, "action=%[^&]&username=%[^&]&data=%s", action, username, data);
        }

        if (strcmp(action, "create") == 0) {
            create_player(username);
        } else if (strcmp(action, "load") == 0) {
            load_player(username);
        } else if (strcmp(action, "leaderboard") == 0) {
            get_leaderboard();
        } else if (strcmp(action, "save") == 0) {
            Player player;
            strcpy(player.username, username);
            
            // Parse data JSON-like string
            // In a real app, you'd use a JSON parser, but we're keeping it simple
            char *pcs_str = strstr(data, "pcs:");
            char *click_value_str = strstr(data, "clickValue:");
            char *pcs_per_second_str = strstr(data, "pcsPerSecond:");
            char *total_clicks_str = strstr(data, "totalClicks:");
            char *total_pcs_str = strstr(data, "totalPcs:");
            char *upgrades_str = strstr(data, "upgrades:[");
            
            if (pcs_str) player.pcs = atoll(pcs_str + 4);
            if (click_value_str) player.click_value = atoi(click_value_str + 11);
            if (pcs_per_second_str) player.pcs_per_second = atoi(pcs_per_second_str + 13);
            if (total_clicks_str) player.total_clicks = atoi(total_clicks_str + 12);
            if (total_pcs_str) player.total_pcs = atoll(total_pcs_str + 10);
            
            // Parse upgrades
            if (upgrades_str) {
                char *start = upgrades_str + 9;
                char *end = strstr(start, "]");
                if (end) {
                    *end = '\0';
                    char *token = strtok(start, ",");
                    int i = 0;
                    while (token != NULL && i < 6) {
                        player.upgrades[i] = atoi(token);
                        token = strtok(NULL, ",");
                        i++;
                    }
                }
            }
            
            player.last_save = time(NULL);
            
            save_player(player);
            update_leaderboard(username, player.total_pcs);
        } else {
            printf("Content-Type: application/json\n\n");
            printf("{\"status\":\"error\",\"message\":\"Invalid action\"}\n");
        }
    }

    return 0;
}

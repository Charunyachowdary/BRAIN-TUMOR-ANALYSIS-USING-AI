#include <windows.h>
#include <winsock2.h>
#include <stdio.h>
#include <string.h>
#pragma comment(lib, "ws2_32.lib")

#define PORT 9090
#define MAX_ROADS 4

int traffic_data[MAX_ROADS] = {10,10,10,10};
char signal_state[MAX_ROADS][10] = {"RED", "RED", "RED", "RED"};

int current_green = 0; int next_road = 0; int timer = 10; int phase = 0;
int manual_mode = 0; int manual_road = -1;

CRITICAL_SECTION cs; HWND hwnd;

void control_signals() {
    for(int i = 0; i < MAX_ROADS; i++)
        strcpy(signal_state[i], "RED");

    if(manual_mode && manual_road >= 0) {
        strcpy(signal_state[manual_road], "GREEN");
        return;
    }

    if(phase == 0)
        strcpy(signal_state[current_green], "GREEN");
    else
        strcpy(signal_state[current_green], "YELLOW");
}

void select_next_road() {
    int max = 0;
    int selected = current_green;

    for(int i = 0; i < MAX_ROADS; i++) {
        if(traffic_data[i] > max) {
            max = traffic_data[i];
            selected = i;
        }
    }

    if(max < 30)
        selected = (current_green + 1) % MAX_ROADS;

    next_road = selected;
}

void draw_roads(HDC hdc) {
    Rectangle(hdc, 0, 220, 500, 280);
    Rectangle(hdc, 220, 0, 280, 500);
}

void draw_dashboard(HDC hdc) {
    draw_roads(hdc);
    char buf[50];
    for(int i = 0; i < 4; i++) {
        sprintf(buf, "R%d: %d (%s)", i, traffic_data[i], signal_state[i]);
        TextOut(hdc, 20, 20 + i * 20, buf, strlen(buf));
    }

    sprintf(buf, "Timer: %d", timer);
    TextOut(hdc, 200, 450, buf, strlen(buf));
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch(msg) {
    case WM_COMMAND: {
        int id = LOWORD(wp);
        EnterCriticalSection(&cs);

        if(id == 1) {
            manual_mode = 0;
        } else if(id >= 2 && id <= 5) {
            manual_mode = 1;
            manual_road = id - 2;
        }

        control_signals();
        LeaveCriticalSection(&cs);
        InvalidateRect(hwnd, NULL, TRUE);
        break;
    }
    case WM_PAINT: {
        PAINTSTRUCT ps;
        HDC hdc = BeginPaint(hwnd, &ps);
        EnterCriticalSection(&cs);
        draw_dashboard(hdc);
        LeaveCriticalSection(&cs);
        EndPaint(hwnd, &ps);
        break;
    }
    case WM_DESTROY:
        PostQuitMessage(0);
        break;
    default:
        return DefWindowProc(hwnd, msg, wp, lp);
    }
    return 0;
}

DWORD WINAPI timer_thread(LPVOID arg) {
    while(1) {
        Sleep(1000);
        EnterCriticalSection(&cs);
        timer--;

        if(timer == 3 && phase == 0)
            phase = 1;

        if(timer <= 0) {
            select_next_road();
            current_green = next_road;
            phase = 0;
            timer = 10;
        }

        control_signals();
        LeaveCriticalSection(&cs);
        InvalidateRect(hwnd, NULL, TRUE);
    }
}

DWORD WINAPI client_handler(LPVOID arg) {
    SOCKET s = (SOCKET)arg;
    free(arg);

    int id;
    recv(s, (char*)&id, sizeof(id), 0);

    while(1) {
        int data;
        int bytes = recv(s, (char*)&data, sizeof(data), 0);
        if(bytes <= 0) break;

        EnterCriticalSection(&cs);
        traffic_data[id] = data;
        LeaveCriticalSection(&cs);
        InvalidateRect(hwnd, NULL, TRUE);
    }

    closesocket(s);
    return 0;
}

DWORD WINAPI server_thread(LPVOID arg) {
    WSADATA wsa;
    SOCKET server_fd;
    struct sockaddr_in addr;

    WSAStartup(MAKEWORD(2,2), &wsa);
    server_fd = socket(AF_INET, SOCK_STREAM, 0);

    addr.sin_family = AF_INET;
    addr.sin_port = htons(PORT);
    addr.sin_addr.s_addr = INADDR_ANY;

    bind(server_fd, (struct sockaddr*)&addr, sizeof(addr));
    listen(server_fd, MAX_ROADS);

    while(1) {
        SOCKET* c = malloc(sizeof(SOCKET));
        *c = accept(server_fd, NULL, NULL);
        CreateThread(NULL, 0, client_handler, c, 0, NULL);
    }
}

int WINAPI WinMain(HINSTANCE hInst, HINSTANCE hPrev, LPSTR args, int nCmd) {
    const char CLASS_NAME[] = "TrafficApp";
    WNDCLASS wc = {0};
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInst;
    wc.lpszClassName = CLASS_NAME;

    RegisterClass(&wc);

    hwnd = CreateWindowEx(0, CLASS_NAME, "Traffic System",
        WS_OVERLAPPEDWINDOW, 100, 100, 500, 500,
        NULL, NULL, hInst, NULL);

    ShowWindow(hwnd, nCmd);
    InitializeCriticalSection(&cs);

    CreateWindow("BUTTON", "AUTO", WS_VISIBLE | WS_CHILD,
        50, 450, 80, 30, hwnd, (HMENU)1, NULL, NULL);

    for(int i = 0; i < 4; i++) {
        char b[10];
        sprintf(b, "R%d", i);
        CreateWindow("BUTTON", b, WS_VISIBLE | WS_CHILD,
            150 + i * 70, 450, 60, 30,
            hwnd, (HMENU)(i + 2), NULL, NULL);
    }

    CreateThread(NULL, 0, server_thread, NULL, 0, NULL);
    CreateThread(NULL, 0, timer_thread, NULL, 0, NULL);

    MSG msg;
    while(GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}

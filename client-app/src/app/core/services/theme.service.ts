import { Injectable, signal } from '@angular/core';

export interface Theme {
    id: string;
    name: string;
    primary: string;
}

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    public themes: Theme[] = [
        { id: 'outlook-blue', name: 'Outlook Blue', primary: '#0078d4' },
        { id: 'outlook-dark', name: 'Outlook Dark', primary: '#201f1e' },
        { id: 'forest-green', name: 'Forest Green', primary: '#107c10' },
        { id: 'sunset-orange', name: 'Sunset Orange', primary: '#d83b01' },
        { id: 'royal-purple', name: 'Royal Purple', primary: '#5c2d91' },
        { id: 'midnight-black', name: 'Midnight Black', primary: '#000000' },
        { id: 'midnight-aurora', name: 'Midnight Aurora', primary: '#00d2ff' },
        { id: 'desert-sunset', name: 'Desert Sunset', primary: '#f46b45' },
    ];

    public currentTheme = signal<Theme>(this.getStoredTheme());

    constructor() {
        this.applyTheme(this.currentTheme().id);
    }

    setTheme(themeId: string) {
        const theme = this.themes.find((t) => t.id === themeId);
        if (theme) {
            this.currentTheme.set(theme);
            localStorage.setItem('preferred-theme', themeId);
            this.applyTheme(themeId);
        }
    }

    private applyTheme(themeId: string) {
        document.documentElement.setAttribute('data-theme', themeId);
    }

    private getStoredTheme(): Theme {
        const stored = localStorage.getItem('preferred-theme');
        return this.themes.find((t) => t.id === stored) || this.themes[0];
    }
}

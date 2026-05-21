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
        { id: 'midnight-aurora', name: 'Midnight Aurora', primary: '#00d2ff' },
        { id: 'forest-health', name: 'Forest Health', primary: '#107c10' },
        { id: 'sunset-vitality', name: 'Sunset Vitality', primary: '#d83b01' },
        { id: 'royal-eminence', name: 'Royal Eminence', primary: '#5c2d91' },
        { id: 'pure-black', name: 'Pure Black', primary: '#ffffff' },
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

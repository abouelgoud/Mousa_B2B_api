import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-global-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './global-search.component.html',
    styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent {
    searchQuery = '';
    showResults = false;

    onSearch() {
        this.showResults = this.searchQuery.length > 2;
    }

    closeSearch() {
        this.showResults = false;
        this.searchQuery = '';
    }
}

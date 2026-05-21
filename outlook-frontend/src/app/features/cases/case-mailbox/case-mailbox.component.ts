import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CaseListComponent } from '../case-list/case-list.component';
import { CaseDetailComponent } from '../case-detail/case-detail.component';

@Component({
    selector: 'app-case-mailbox',
    standalone: true,
    imports: [CommonModule, CaseListComponent, CaseDetailComponent],
    templateUrl: './case-mailbox.component.html',
    styleUrls: ['./case-mailbox.component.scss']
})
export class CaseMailboxComponent {
    private route = inject(ActivatedRoute);

    selectedCaseId: string | null = null;
    currentFilter = signal<string>('worklist');

    constructor() {
        this.route.params.subscribe(params => {
            const filter = params['filter'] || 'worklist';
            this.currentFilter.set(filter);
            this.selectedCaseId = null; // Clear selection on folder change
        });
    }

    onCaseSelected(caseId: string) {
        this.selectedCaseId = caseId;
    }
}

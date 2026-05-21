import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../../core/services/case.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-case-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './case-list.component.html',
    styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnChanges {
    @Input() filter: string = 'worklist';
    @Output() caseSelected = new EventEmitter<string>();

    caseService = inject(CaseService);
    authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    cases = signal<any[]>([]);
    selectedId = signal<string | null>(null);
    loading = signal<boolean>(false);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['filter']) {
            this.loadCases();
            this.selectedId.set(null); // Clear selection on filter change
        }
    }

    loadCases() {
        const user = this.authService.currentUser();
        this.loading.set(true);

        if (this.filter === 'waiting-queue') {
            this.caseService.getWaitingQueue().subscribe({
                next: (data: any) => {
                    const list = (data && data.data && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : []);
                    this.cases.set(list);
                    this.loading.set(false);
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error('Failed to load waiting queue', err);
                    this.loading.set(false);
                    this.cdr.detectChanges();
                }
            });
        } else {
            // Default to worklist
            if (user?.providerId) {
                this.caseService.getProviderWorklist(user.providerId).subscribe({
                    next: (data: any) => {
                        const list = (data && data.data && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : []);
                        this.cases.set(list);
                        this.loading.set(false);
                        this.cdr.detectChanges();
                    },
                    error: (err: any) => {
                        console.error('Failed to load worklist', err);
                        this.loading.set(false);
                        this.cdr.detectChanges();
                    }
                });
            } else {
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        }
    }

    selectCase(id: string) {
        this.selectedId.set(id);
        this.caseSelected.emit(id);
    }

    getStatusColor(status: number): string {
        switch (status) {
            case 1: return 'primary';
            case 2: return 'info';
            case 3: return 'warning';
            case 4: return 'purple';
            case 8: return 'success';
            default: return 'secondary';
        }
    }
}

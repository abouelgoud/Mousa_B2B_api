import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-feature-placeholder',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
      <i class="bi bi-cone-striped display-1 mb-3 opacity-25"></i>
      <h2 class="fw-light">Under Construction</h2>
      <p class="lead">{{ featureName }}</p>
      <p class="small">This feature from the original app is being migrated.</p>
    </div>
  `,
    styles: []
})
export class FeaturePlaceholderComponent {
    private route = inject(ActivatedRoute);
    featureName = '';

    constructor() {
        this.route.data.subscribe(data => {
            this.featureName = data['name'] || 'Feature';
        });
    }
}

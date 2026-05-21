import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
    selector: '[hasPermission]',
    standalone: true
})
export class HasPermissionDirective {
    private authService = inject(AuthService);
    private templateRef = inject(TemplateRef<any>);
    private viewContainer = inject(ViewContainerRef);

    private isVisible = false;

    @Input() set hasPermission(permission: string) {
        if (this.authService.hasPermission(permission)) {
            if (!this.isVisible) {
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.isVisible = true;
            }
        } else {
            this.viewContainer.clear();
            this.isVisible = false;
        }
    }
}

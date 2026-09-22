import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmUpdateDialogComponent } from './confirm-update-dialog.component';

describe('ConfirmUpdateDialogComponent', () => {
    let component: ConfirmUpdateDialogComponent;
    let fixture: ComponentFixture<ConfirmUpdateDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ConfirmUpdateDialogComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmUpdateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

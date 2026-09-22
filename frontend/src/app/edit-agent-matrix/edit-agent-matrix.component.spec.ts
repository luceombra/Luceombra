import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAgentMatrixComponent } from './edit-agent-matrix.component';

describe('EditAgentMatrixComponent', () => {
	let component: EditAgentMatrixComponent;
	let fixture: ComponentFixture<EditAgentMatrixComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ EditAgentMatrixComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EditAgentMatrixComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

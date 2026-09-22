import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAgentMatrixComponent } from './add-agent-matrix.component';

describe('AddAgentMatrixComponent', () => {
	let component: AddAgentMatrixComponent;
	let fixture: ComponentFixture<AddAgentMatrixComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ AddAgentMatrixComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AddAgentMatrixComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private storageService = inject(StorageService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  settingsForm: FormGroup;

  constructor() {
    const targets = this.storageService.getTargets();
    this.settingsForm = this.fb.group({
      proteins: [targets?.proteins || 0, [Validators.required, Validators.min(0)]],
      fats: [targets?.fats || 0, [Validators.required, Validators.min(0)]],
      carbs: [targets?.carbs || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      const values = this.settingsForm.value;
      this.storageService.saveTargets({
        proteins: this.roundToHalf(values.proteins),
        fats: this.roundToHalf(values.fats),
        carbs: this.roundToHalf(values.carbs)
      });
      this.router.navigate(['/']);
    }
  }

  adjustValue(controlName: 'proteins' | 'fats' | 'carbs', delta: number): void {
    const currentValue = this.settingsForm.get(controlName)?.value || 0;
    const newValue = Math.max(0, this.roundToHalf(currentValue + delta));
    this.settingsForm.patchValue({ [controlName]: newValue });
  }

  private roundToHalf(value: number): number {
    return Math.round(value * 2) / 2;
  }
}


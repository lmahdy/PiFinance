import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="grid grid-2">
      <div class="card">
        <h2>My Profile</h2>
        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <div class="profile-row">
          <div>
            <div class="avatar" *ngIf="avatar">
              <img [src]="avatar" alt="avatar" />
            </div>
            <div class="avatar placeholder" *ngIf="!avatar">No photo</div>
            <input type="file" (change)="onFile($event)" />
          </div>
          <div class="info">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" />
            <p><strong>Role:</strong> {{ user.role }}</p>
            <label>Display Name</label>
            <input type="text" [(ngModel)]="displayName" />
            <button class="button" (click)="saveProfile()">Save Profile</button>
            <p class="hint" *ngIf="saveMessage">{{ saveMessage }}</p>
          </div>
        </div>
      </div>

      <div class="card" *ngIf="companyConfig">
        <h2>Company Config</h2>
        <label>Company Name</label>
        <input type="text" [(ngModel)]="companyConfig.companyName" [disabled]="!isOwner" />

        <label>Tax Rate (%)</label>
        <input type="number" [(ngModel)]="companyConfig.taxRate" [disabled]="!isOwner" min="0" step="0.01" />

        <label>Currency</label>
        <input type="text" [(ngModel)]="companyConfig.currency" [disabled]="!isOwner" />

        <label>Notification Email</label>
        <input type="email" [(ngModel)]="companyConfig.email" [disabled]="!isOwner" />

        <button class="button" (click)="saveCompany()" [disabled]="!isOwner">Save Company Config</button>
        <p class="hint" *ngIf="companyMessage">{{ companyMessage }}</p>
        <p class="hint" *ngIf="!isOwner">Only CompanyOwner can edit company config.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-row { display: flex; gap: 16px; align-items: flex-start; }
      .avatar { width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 1px solid #e5e7eb; }
      .avatar img { width: 100%; height: 100%; object-fit: cover; }
      .avatar.placeholder { display: grid; place-items: center; color: #9ca3af; font-size: 12px; }
      .info input { width: 100%; }
      input { padding: 8px; border-radius: 6px; border: 1px solid #d1d5db; margin-bottom: 8px; }
      .hint { font-size: 12px; color: #6b7280; }
      .error { color: #b91c1c; margin-bottom: 8px; }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  user: any = {};
  companyConfig: any = null;
  displayName = '';
  email = '';
  avatar = '';
  saveMessage = '';
  companyMessage = '';
  errorMessage = '';

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  get isOwner() {
    return this.user?.role === 'CompanyOwner';
  }

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.api.getProfile().subscribe({
      next: (data) => {
        this.user = data.user;
        this.displayName = data.user.displayName || '';
        this.email = data.user.email || '';
        this.avatar = data.user.avatar || '';
        this.companyConfig = data.companyConfig;
        this.errorMessage = '';
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please log in again.';
        } else {
          this.errorMessage = 'Failed to load profile.';
        }
      },
    });
  }

  onFile(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.avatar = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    this.api
      .updateProfile({ displayName: this.displayName, avatar: this.avatar, email: this.email })
      .subscribe({
        next: (res) => {
          if (res?.access_token) {
            this.auth.setToken(res.access_token);
          }
          this.saveMessage = 'Profile saved';
        },
        error: (err) => {
          this.saveMessage = err?.error?.message || 'Failed to save profile';
        },
      });
  }

  saveCompany() {
    if (!this.isOwner || !this.companyConfig) return;
    this.api
      .saveCompanyConfig({
        companyName: this.companyConfig.companyName,
        taxRate: this.companyConfig.taxRate,
        currency: this.companyConfig.currency,
        email: this.companyConfig.email,
      })
      .subscribe({
        next: () => (this.companyMessage = 'Company config saved'),
        error: () => (this.companyMessage = 'Failed to save company config'),
      });
  }
}

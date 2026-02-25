import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loggedOutGuard } from './guards/logged-out.guard';
import { roleGuard } from './guards/role.guard';
import { ApplicantsComponent } from './employer/applicants/applicants.component';
import { DashboardComponent } from './employer/dashboard/dashboard.component';
import { JobPostingsComponent } from './employer/job-postings/job-postings.component';
import { EmployerProfileComponent } from './employer/profile/profile.component';
import { NotificationCenterComponent } from './notifications/notification-center/notification-center.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ApplicationsComponent } from './seeker/applications/applications.component';
import { FavoritesComponent } from './seeker/favorites/favorites.component';
import { JobSearchComponent } from './seeker/job-search/job-search.component';
import { ProfileComponent } from './seeker/profile/profile.component';
import { ResumeBuilderComponent } from './seeker/resume-builder/resume-builder.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [loggedOutGuard] },
  { path: 'login', component: LoginComponent, canActivate: [loggedOutGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loggedOutGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
  { path: 'job-seeker-dashboard', redirectTo: 'seeker/jobs' },
  { path: 'employer-dashboard', redirectTo: 'employer/dashboard' },
  { path: 'register/seeker', redirectTo: 'register' },
  { path: 'register/employer', redirectTo: 'register' },
  {
    path: 'seeker/jobs',
    component: JobSearchComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'seeker' }
  },
  {
    path: 'seeker/applications',
    component: ApplicationsComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'seeker' }
  },
  {
    path: 'seeker/profile',
    component: ProfileComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'seeker' }
  },
  {
    path: 'seeker/resume',
    component: ResumeBuilderComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'seeker' }
  },
  {
    path: 'seeker/favorites',
    component: FavoritesComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'seeker' }
  },
  {
    path: 'employer/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'employer' }
  },
  {
    path: 'employer/profile',
    component: EmployerProfileComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'employer' }
  },
  {
    path: 'employer/jobs',
    component: JobPostingsComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'employer' }
  },
  {
    path: 'employer/applicants',
    component: ApplicantsComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'employer' }
  },
  { path: 'notifications', component: NotificationCenterComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

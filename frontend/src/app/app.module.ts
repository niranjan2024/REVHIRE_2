import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './core/layout/navbar/navbar.component';
import { ApplicantsComponent } from './employer/applicants/applicants.component';
import { DashboardComponent } from './employer/dashboard/dashboard.component';
import { JobPostingsComponent } from './employer/job-postings/job-postings.component';
import { EmployerProfileComponent } from './employer/profile/profile.component';
import { NotificationCenterComponent } from './notifications/notification-center/notification-center.component';
import { HomeComponent } from './pages/home/home.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ApplicationsComponent } from './seeker/applications/applications.component';
import { FavoritesComponent } from './seeker/favorites/favorites.component';
import { JobSearchComponent } from './seeker/job-search/job-search.component';
import { ProfileComponent } from './seeker/profile/profile.component';
import { ResumeBuilderComponent } from './seeker/resume-builder/resume-builder.component';
import { JobCardComponent } from './shared/job-card/job-card.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    JobSearchComponent,
    ApplicationsComponent,
    ProfileComponent,
    ResumeBuilderComponent,
    FavoritesComponent,
    DashboardComponent,
    EmployerProfileComponent,
    JobPostingsComponent,
    ApplicantsComponent,
    NotificationCenterComponent,
    JobCardComponent
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

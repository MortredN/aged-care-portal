import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.router.navigate(['/404']);
  }
  
  // Click on the go to homepage button
  clickHome() {
    // 'false' is used - not initializing from the Login Component
    this.authService.navigateToHome(false);
  }

}

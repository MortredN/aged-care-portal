import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth.service';
import { VisitorService } from '../../visitor.service';
import { capitalize } from 'src/app/functions';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-v-r-add',
  templateUrl: './v-r-add.component.html',
  styleUrls: ['./v-r-add.component.scss']
})
export class V_R_AddComponent implements OnInit {

  // The logged contractor ID
  id: string

  constructor(
    private authService: AuthService,
    private visitorService: VisitorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.router.navigate(['/visitor', 'resident-add']);

    this.validateUserType().then(res => {
      if(res) {
        this.visitorService.getAuthState().pipe(
          mergeMap(authState => {
            // Get query snapshot to get logged visitor ID
            return this.visitorService.getQuerySnapshotByEmail(authState.email, 'visitor');
          }))
          .subscribe(querySnapshot => {
            // Get the logged visitor ID
            this.id = this.visitorService.getIdFromEmailQuerySnapshot(querySnapshot);
            
            // 'Enter' when selecting input field will run
            $('#inputFirstName, #inputLastName').keyup(e => {
              if(e.which == 13) {
                this.addResident();
              }
            });
          })
      }
    });
  }

  validateUserType() {
    return new Promise((resolve, reject) => {
      this.authService.checkUserType();
      resolve(this.router.url.includes("/visitor/resident-add"));
    })
  }

  addResident() {
    // Initialize temporary attribute which values taken from the input field
    // Capitalize some fields if needed
    const rFirstName = capitalize($('#inputFirstName').val());
    const rLastName = capitalize($('#inputLastName').val());
    // Check if there are any empty fields
    if(rFirstName != "" && rLastName != "") {
      this.visitorService.addResident(this.id, rFirstName, rLastName);
    }
    else { // Return an alert if there is an empty field
      Swal.fire({
        title: "Error!",
        html: "Some fields are left empty!",
        type: 'error'
      })
    }
  }

}

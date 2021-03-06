import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { AuthService } from '../../../auth.service';
import { StaffService } from '../../staff.service';
import { Visitor } from 'src/app/classes';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-s-v-view',
  templateUrl: './s-v-view.component.html',
  styleUrls: ['./s-v-view.component.scss']
})
export class S_V_ViewComponent implements OnInit {

  // Predefined properties
  private pagesNum: number;
  private outputVisitors: Visitor[][];

  constructor(
    private router: Router,
    private authService: AuthService,
    private staffService: StaffService
  ) { }

  ngOnInit() {
    this.router.navigate(['/staff', 'visitor-view']);

    $('span#current-contractors').hide();

    this.validateUserType().then(res => {
      if(res) {
        this.staffService.getVisitors().pipe(
          mergeMap(res => {
            // Load the component with provided visitors
            this.loadComponent(res);
            return this.staffService.getCurrentContractors();
          }),
          mergeMap(cNumSnapshot => {
            // Get number of current contractors
            $('strong#current-contractors-num').text(cNumSnapshot.size);
            $('strong#current-contractors-num').css("user-select", "none");
            return this.staffService.getCurrentVisitors();
          }))
          .subscribe(vNumSnapshot => {
            // Get number of current visitors
            $('strong#current-visitors-num').text(vNumSnapshot.size);
            $('strong#current-visitors-num').css("user-select", "none");
          });
      }
    });
  }

  validateUserType() {
    return new Promise((resolve, reject) => {
      this.authService.checkUserType();
      resolve(this.router.url.includes("/staff/visitor-view"));
    })
  }

  switchCurrentNum(numType: string) {
    if(numType == 'contractors') {
      $('span#current-contractors').show();
      $('span#current-visitors').hide();
    }
    else {
      $('span#current-visitors').show();
      $('span#current-contractors').hide();
    }
  }

  loadComponent(visitors: Visitor[]) {
    $('div#pages').empty();

    // Place provided contractors into paged sections
    let visitorsNum = visitors.length;
    this.pagesNum = ((visitorsNum / 8) == 0) ? 1 : Math.ceil(visitorsNum / 8);
    this.outputVisitors = new Array(this.pagesNum);
    for(let iPage = 0; iPage < this.pagesNum; iPage++) {
      const fill = (visitorsNum < 8) ? visitorsNum : 8;
      this.outputVisitors[iPage] = new Array(fill);
      for(let iVis = 0; iVis < fill; iVis++) {
        this.outputVisitors[iPage][iVis] = visitors[0];
        visitors.shift();
        visitorsNum--;
      }
    }

    // Pagination
    for(let iPage = 1; iPage <= this.pagesNum; iPage++) {
      $('div#pages').append('<span id="page-'+ iPage +'" class="page"><p>'+ iPage +'</p></span>');
      $('#page-'+ iPage).click(() => {
        this.clickPage(iPage);
      });
    }
    $('span.page').css({
      'display': 'inline-block',
      'width': '30px',
      'height': '30px',
      'border-radius': '50%',
      'background-color': '#E9EBEC',
      'margin': '5px',
      'cursor': 'pointer'
    });
    $('span.page > p').css({
      'color': '#313B45',
      'font-size': '15px',
      'font-weight': '400',
      'text-transform': 'uppercase',
      'margin': '5px',
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      '-ms-user-select': 'none',
      'user-select': 'none'
    });
    if(this.pagesNum > 7) {
      for(let iPage = 7; iPage < this.pagesNum; iPage++) {
        $('span#page-'+ iPage).hide();
      }
    }
    
    // Initial click on first page
    this.clickPage(1);
  }

  clickPage(page: number) {
    $('span.page').css('background-color', '#E9EBEC');
    $('span#page-'+ page).css('background-color', '#B0B5BA');
  
    // First and last page number will always at the two ends
    if(this.pagesNum > 7) {
      for(let iPage = 2; iPage < this.pagesNum; iPage++) {
        $('span#page-'+ iPage).hide();
      }

      if(page <= 4){
        for(let iPage = 2; iPage <= 6; iPage++) {
          $('span#page-'+ iPage).show();
        }
      }
      else if(page >= (this.pagesNum - 3)) {
        for(let iPage = this.pagesNum - 5; iPage < this.pagesNum; iPage++) {
          $('span#page-'+ iPage).show();
        }
      }
      else {
        for(let iPage = page - 2; iPage <= page + 2; iPage++) {
          $('span#page-'+ iPage).show();
        }
      }
    }

    // Print out basic info and show the buttons only if there is a visitor exist in a particular paged section
    const output = this.outputVisitors[page - 1];
    $('table#item-list-xs > tr.item').hide();
    for(let i = 1; i <= 8; i++) {
      $('p#visitor-name-'+ i).empty();
    }
    $('td.td-btn-danger > span').hide();
    $('td.td-btn-img > span').hide();
    for(let i = 1; i <= output.length; i++) {
      $('table#item-list-xs > tr#item-'+ i +'-text').show();
      $('table#item-list-xs > tr#item-'+ i +'-btn').show();
      const visitor = output[i - 1];
      $('p#visitor-name-'+ i).text(visitor.vFirstName + " " + visitor.vLastName);
      $('tr#item-'+ i +' > td.td-btn-danger > span').show();
      $('tr#item-'+ i +'-btn > td.td-btn-danger > span').show();

      $('p#visitor-name-'+ i).click(() => {
        this.clickInfo(visitor);
      })

      if(visitor.flags.length != 0){
        $('tr#item-'+ i +' > td.td-btn-img > span').show();
        $('tr#item-'+ i +'-btn > td.td-btn-img > span').show();
        $('tr#item-'+ i +' > td.td-btn-img > span').click(() => {
          this.clickInfo(visitor);
        })
        $('tr#item-'+ i +'-btn > td.td-btn-img > span').click(() => {
          this.clickInfo(visitor);
        })
      }

      $('tr#item-'+ i +' > td.td-btn-danger > span').click(() => {
        this.clickFlag(visitor.id);
      });
      $('tr#item-'+ i +'-btn > td.td-btn-danger > span').click(() => {
        this.clickFlag(visitor.id);
      });
    }
  }

  clickInfo(visitor: Visitor) {
    // Return an info alert with details info
    Swal.fire({
      title: `Visitor: ${visitor.vFirstName} ${visitor.vLastName}`,
      html:
      `Email: ${visitor.email}<br>
      Phone: ${visitor.phone}<br>
      Flagged: ${(visitor.flags.length != 0) ? "Yes" : "No"}`,
      type: 'info'
    })
  }

  clickFlag(id: string){
    // Return a confirmation alert
    Swal.fire({
      title: "Flag?",
      html: "Are you sure you want to flag this visitor?",
      type: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      focusCancel: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes"
    })
    .then((willFlag) => {
      if(willFlag.value) {
        // Return an alert with an input text field: reason
        Swal.fire({
          input: 'text',
          inputPlaceholder: 'Reason',
          type: 'question'
        })
        .then((reason) => {
          if(reason.value != "") {
            // Return a confirmation alert
            Swal.fire({
              html: `Reason: ${reason.value}`,
              type: 'warning',
              showCancelButton: true,
              reverseButtons: true,
              focusCancel: true,
              cancelButtonText: "Cancel",
              confirmButtonText: "Flag"
            })
            .then((confirmFlag) => {
              if(confirmFlag.value) {
                this.staffService.flagVisitor(id, reason.value);
              }
            });
          }
          else { // Return an alert if input field is empty
            Swal.fire({
              title: "Error!",
              html: "Please give a reason!",
              type: "error"
            })
          }
        })
      }
    })
  }

  logOut() {
    this.authService.logOut();
    this.router.navigate(['/login', 'login-s']);
  }

}

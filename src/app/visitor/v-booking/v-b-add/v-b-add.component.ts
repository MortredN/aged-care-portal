import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth.service';
import { VisitorService } from '../../visitor.service';
import { WeeklySchedules } from '../../../classes';
import { mergeMap } from 'rxjs/operators';
import { arrayConsecutive, sortNumArray } from 'src/app/functions';

@Component({
  selector: 'app-v-b-add',
  templateUrl: './v-b-add.component.html',
  styleUrls: ['./v-b-add.component.scss']
})
export class V_B_AddComponent implements OnInit {

  // The selected resident ID
  id: string

  // Section's id for jQuery selectors
  lA = "table.list-add "

  // Predefined properties
  private initialClick: boolean;
  private weeklySchedules: WeeklySchedules;
  private today: Date;
  private selectedSlots: number[];

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService
  ) { }

  ngOnInit() {
    this.router.navigate(['/visitor', 'booking-add']);
    
    this.validateUserType().then(res => {
      if(res) {
        this.visitorService.residentId.pipe(
          mergeMap(id => {
            // Get the passed resident ID
            this.id = id;
            return this.visitorService.getResident(this.id);
          }))
          .subscribe(resident => {
            // Convert resident's schedule
            const rName = resident.rFirstName + " " + resident.rLastName;
            this.weeklySchedules = this.visitorService.convertWeeklySchedule(rName, resident.schedule);
            this.loadComponent();
          });
      }
    });
  }

  validateUserType() {
    return new Promise((resolve, reject) => {
      this.authService.checkUserType();
      resolve(this.router.url.includes("/visitor/booking-add"));
    })
  }

  loadComponent() {
    $('div#list-main > h1').text("SCHEDULE: " + this.weeklySchedules.rName);

    // Initialize default values
    this.selectedSlots = [];
    this.initialClick = true;
    this.today = new Date();

    // Create a date picker (Calender to select date)
    this.datePicker(this.today);
    $('span#calendar-icon').click(() => {
      $('div#dp').show();
    });

    $('div#dp-close').click(() => {
      $('div#dp').hide();
    });
  }

  // Custom date picker generation
  datePicker(date: Date) {
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    $('span#dp-prev').click(() => {
      const prevMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      this.datePicker(prevMonth);
    });
    $('span#dp-next').click(() => {
      const nextMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      this.datePicker(nextMonth);
    });
    $('table#dp-body td').text("");
    const daysBefore = firstDate.getDay();
    const month = firstDate.getMonth();
    const year = firstDate.getFullYear();
    if(this.initialClick){
      this.selectDate(date);
      $('p.p-date').text(
        ((date.getDate() < 10) ? "0" + date.getDate() : date.getDate())  + "/" +
        ((month + 1 < 10) ? "0" + (month + 1) : month + 1) + "/" +
        year);
      this.initialClick = false;
    }
    let daysNum = 0;
    switch(month){
      case 0: $('span#dp-my').text("January " + year); daysNum = 31; break;
      case 1: $('span#dp-my').text("Febuary " + year);
        if(year % 4 == 0) {
          if(year % 100 == 0) {
            if(year % 400 == 0) {
              daysNum = 29;
            } else { daysNum = 28; }
          } else { daysNum = 29; }
        } else { daysNum = 28; }
        break;
      case 2: $('span#dp-my').text("March " + year); daysNum = 31; break;
      case 3: $('span#dp-my').text("April " + year); daysNum = 30; break;
      case 4: $('span#dp-my').text("May " + year); daysNum = 31; break;
      case 5: $('span#dp-my').text("June " + year); daysNum = 30; break;
      case 6: $('span#dp-my').text("July " + year); daysNum = 31; break;
      case 7: $('span#dp-my').text("August " + year); daysNum = 31; break;
      case 8: $('span#dp-my').text("September " + year); daysNum = 30; break;
      case 9: $('span#dp-my').text("October " + year); daysNum = 31; break;
      case 10: $('span#dp-my').text("November " + year); daysNum = 30; break;
      default: $('span#dp-my').text("December " + year); daysNum = 31; break;
    }
    let cellInRow = 0;
    let rowIndex = 1;
    for(let i = 0; i < daysBefore; i++) {
      cellInRow++;
    }
    for(let i = 1; i <= daysNum; i++) {
      if(cellInRow >= 7){
        cellInRow = 0;
        rowIndex++;
      }
      $('tr#dp-row-' + rowIndex + '> td:eq('+ cellInRow +')').off('click');
      const outputDate = new Date(year, month, i);
      if(this.today.getFullYear() < outputDate.getFullYear() ||
        (this.today.getFullYear() == outputDate.getFullYear() && this.today.getMonth() < outputDate.getMonth()) ||
        (this.today.getFullYear() == outputDate.getFullYear() && this.today.getMonth() == outputDate.getMonth() && this.today.getDate() <= outputDate.getDate())) {
        $('tr#dp-row-' + rowIndex + '> td:eq('+ cellInRow +')').text(i);
        $('tr#dp-row-' + rowIndex + '> td:eq('+ cellInRow +')').click(() => {
          this.selectDate(outputDate);
          $('p.p-date').text(
            ((i < 10) ? "0" + i : i)  + "/" +
            ((month + 1 < 10) ? "0" + (month + 1) : month + 1) + "/" +
            year);
          $('div#dp').hide();
        });
      } else {
        $('tr#dp-row-' + rowIndex + '> td:eq('+ cellInRow +')').text("");
      }
      cellInRow++;
    }

    // Calendar styling
    $("table#dp-body td").css({
      "padding": "5px",
      "border": "none",
      "cursor": "pointer",
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      'user-select': 'none'
    });
  }

  selectDate(date: Date){
    this.selectedSlots = [];
    const dateStr = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "/"
      + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "/"
      + date.getFullYear();
    this.visitorService.getBookingsByDate(this.id, dateStr).toPromise()
    .then((snapshot) => {
      const bookedSlots = this.visitorService.getBookedSlots(snapshot);
      const daySchedule = this.weeklySchedules.schedules[date.getDay()];
        for(let i = 7; i <= 22; i++) {
          if(daySchedule[i - 7].hour == i){
            $(this.lA + 'div#task-div-'+ i +" > span").off('click');
            // If slot is already been booked
            if(bookedSlots.includes(i)) {
              $(this.lA + 'p#task-'+ i).text("Meeting booked");
              $(this.lA + 'div#task-div-'+ i +" > span").css({
                'background-color': '#EDAAAA',
                'cursor': 'not-allowed'
              });
            }
            // If slot is not available
            else if(!daySchedule[i - 7].available){
              $(this.lA + 'p#task-'+ i).text(daySchedule[i - 7].activity);
              $(this.lA + 'div#task-div-'+ i +" > span").css({
                'background-color': '#EDAAAA',
                'cursor': 'not-allowed'
              });
            }
            // If slot is available
            else {
              $(this.lA + 'p#task-'+ i).text("Available");
              $(this.lA + 'div#task-div-'+ i +" > span").css({
                'background-color': '#C4DBB3',
                'cursor': 'pointer'
              });
              $(this.lA + 'div#task-div-'+ i +" > span").click(() => {
                this.selectSlot(i);
              });
            }
          }
        }
    })
  }

  selectSlot(hour: number) {
    if(this.selectedSlots.includes(hour)) { // If remove an already selected slot
      if(arrayConsecutive(this.selectedSlots, hour, false)) {
        $(this.lA + 'p#task-'+ hour).text("Available");
        $(this.lA + 'div#task-div-'+ hour +" > span").css({
          'background-color': '#C4DBB3',
          'cursor': 'pointer'
        });
        this.selectedSlots = this.selectedSlots.filter((value) => {return value != hour});
      }
      else { // Return an alert if the selected time slots are not consecutive to each other
        Swal.fire({
          title: "Error!",
          html: "Time slots must be next to each other!",
          type: 'error'
        })
      }
    }
    else { // If select a new slot to add in
      if(arrayConsecutive(this.selectedSlots, hour, true)) {
        $(this.lA + 'p#task-'+ hour).text("Selected");
        $(this.lA + 'div#task-div-'+ hour +" > span").css({
          'background-color': '#9BCCE7',
          'cursor': 'pointer'
        });
        this.selectedSlots.push(hour);
        sortNumArray(this.selectedSlots);
      }
      else { // Return an alert if the selected time slots are not consecutive to each other
        Swal.fire({
          title: "Error!",
          html: "Time slots must be next to each other!",
          type: 'error'
        })
      }
    }
  }

  addBooking() {
    const dateStr = $('p.p-date').text();
    if(this.selectedSlots.length != 0) {
      // Return a confirmation alert
      Swal.fire({
        title: "Add?",
        html: `Are you sure you want to add this booking?<br>
        Visiting time: ${this.selectedSlots[0]}:00 ${dateStr}`,
        type: 'question',
        showCancelButton: true,
        reverseButtons: true,
        focusCancel: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes"
      })
      .then((willAdd) => {
        if(willAdd.value) {
          this.visitorService.addBooking(this.id, this.weeklySchedules.rName, dateStr, this.selectedSlots);
        }
      })
    }
    else { // Return an alert if no time slots are selected
      Swal.fire({
        title: "Error!",
        html: "Please select at least one booking slot!",
        type: 'error'
      })
    }
  }

}

import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import { Observable, BehaviorSubject } from 'rxjs';
import { Resident, Visitor, Flag, Rating, Feedback, WeeklySchedules, ScheduleSlot, Booking } from '../classes';
import { take } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) { }

  getCurrentVisitors() {
    return this.afs.collection('visitors', ref => ref.where('inFacility', '==', true)).get();
  }

  getCurrentContractors() {
    return this.afs.collection('contractors', ref => ref.where('inFacility', '==', true)).get();
  }

  private residentIdSource = new BehaviorSubject<string>("");
  residentId = this.residentIdSource.asObservable();

  passResidentId(id: string) {
    this.residentIdSource.next(id);
  }

  residents: Observable<Resident[]>;
  resident: Observable<Resident>;

  getResidents() {
    this.residents = this.afs.collection('residents').valueChanges();
    return this.residents;
  }

  getResident(id: string) {
    this.resident = this.afs.collection('residents').doc(id).valueChanges();
    return this.resident;
  }

  convertWeeklySchedule(rName: string, schedule: any) {
    let weeklySchedules = new WeeklySchedules(rName, [[],[],[],[],[],[],[]]);
    for(let i = 0; i <= 6; i++) {
      for(let h = 7; h <= 22; h++) {
        weeklySchedules.schedules[i].push(new ScheduleSlot(h, schedule[i][h].available, schedule[i][h].activity));
      }
    }
    return weeklySchedules;
  }

  bookingsCollection: AngularFirestoreCollection<Booking>;

  getBookedSlots(snapshot) {
    let bookedSlots: number[] = [];
    snapshot.forEach(doc => {
      bookedSlots = bookedSlots.concat(doc.data().timeSlots);
    })
    return bookedSlots;
  }

  getBookingsByDate(residentId: string, date: string) {
    return this.afs.collection('bookings', ref => ref
      .where('residentId', '==', residentId)
      .where('date', '==', date)
      .where('isCancelled', '==', false)).get();
  }


  addBooking(residentId: string, rName: string, date: string, timeSlots: number[]) {
    this.bookingsCollection = this.afs.collection('bookings', ref => ref.where('date', '==', date));
    this.bookingsCollection.get().toPromise().then(bookingSnapshot => {
      let bookingId = "";
      if(bookingSnapshot.docs.length != 0) {
        const latestId = bookingSnapshot.docs[bookingSnapshot.docs.length - 1].id;
        const newIdentifier = parseInt(latestId.substring(8)) + 1;
        bookingId = date.substring(6) + date.substring(3, 5) + date.substring(0, 2) + ((newIdentifier < 10) ? "0" + newIdentifier.toString() : newIdentifier.toString());
      }
      else {
        bookingId = date.substring(6) + date.substring(3, 5) + date.substring(0, 2) + "01";
      }
      const booking = new Booking(bookingId, residentId, rName, date, timeSlots, false);
      this.bookingsCollection.doc(bookingId).set(Object.assign({}, booking))
        .then(() => {
          swal({
            title: "Success!",
            text: "Booking added successfully!",
            icon: "success",
            buttons: {
              ok: "OK"
            }
          } as any)
          this.router.navigate(['/staff', 'resident-view'])
        });
    })
  }

  makeScheduleChange(residentId: string, activity: string, day: number, hour: number) {
    activity = (activity == "Available") ? "" : activity;
    const update = {};
    update[`schedule.${day}.${hour}`] = {
      activity: activity,
      available: (activity == "")
    }
    this.afs.collection('residents').doc(residentId).update(update)
      .then(() => {
        swal({
          title: "Success!",
          text: "Change made!",
          icon: "success",
          buttons: {
            ok: "OK"
          }
        } as any)
      });
  }

  visitors: Observable<Visitor[]>;

  getVisitors() {
    this.visitors = this.afs.collection('visitors').valueChanges();
    return this.visitors;
  }

  flagVisitor(id: string, reason: string) {
    this.afAuth.authState.pipe(take(1))
      .subscribe(user => {
        console.log(user)
        this.afs.collection('staffs', ref => ref.where('email', '==', user.email)).get().toPromise()
          .then(snapshot => {
            console.log(snapshot)
            snapshot.forEach(doc => {
              const staffName = doc.data().sFirstName + " " + doc.data().sLastName;
              this.afs.collection('visitors').doc(id).get().toPromise()
              .then((doc) => {
                console.log(doc)
                let flags: any[] = doc.data().flags;
                const date = new Date();
                const dateStr = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "/"
                  + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "/"
                  + date.getFullYear();
                flags.unshift(new Flag(dateStr, staffName, reason));
                this.afs.collection('visitors').doc(id).update({flags: JSON.parse(JSON.stringify(flags))});
                swal("Visitor flagged!", {
                  icon: "success",
                })
              });
            })
          })
      })
  }

  ratings: Observable<Rating>;

  getRatings() {
    this.ratings = this.afs.collection('ratings').doc('ratings').valueChanges();
    return this.ratings;
  }

  feedbacks: Observable<Feedback[]>;

  getFeedbacks() {
    this.feedbacks = this.afs.collection('feedbacks').valueChanges();
    return this.feedbacks;
  }
}

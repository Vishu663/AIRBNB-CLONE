import axios from "axios";
import { differenceInCalendarDays } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function BookingWidget({place}) {
  const [checkIn,setCheckIn] = useState('');
  const[checkOut,setCheckOut] = useState('');
  const[numberOfGuests,setNumberOfGuests] =useState(1);
  const[name,setName] = useState('');
  const[phone,setPhone] = useState('');
  const[redirect,setRedirect] = useState('');
  const {user} = useContext(UserContext);

  useEffect(() => {
    if(user) {
      setName(user.name);
    }
  }, [user])

  let numberOfNights = 0;
  if(checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
  }


  async function bookThisPlace() {
    const response = await axios.post('/bookings', {
      checkIn,checkOut,numberOfGuests,name,phone,
      place:place._id,
      price:numberOfNights * place.price,
    });
    const bookingId = response.data._id;
    setRedirect(`/account/bookings/${bookingId}`);
  }


  if(redirect) {
    return <Navigate to={redirect} />
  }
  
  return(
        <div className="bg-white shadow p-4 rounded-2xl">
            <div className="text-2xl text-center">
              price: ₹{place.price} / per night
            </div>
            <div className="border rounded-2xl mt-4">
              <div className="flex grid grid-cols-1 sm:grid-cols-2">
                <div className="py-3 px-4 flex-grow">
                  <label>CheckIn:</label>
                  <input type="date" className="w-full" value={checkIn} onChange={ev => setCheckIn(ev.target.value)} />
                </div>
                <div className="py-3 px-4 border-l flex-grow">
                  <label>CheckOut:</label>
                  <input type="date" className="w-full" value={checkOut} onChange={ev => setCheckOut(ev.target.value)} />
                </div>
              </div>
              <div className="py-3 px-4 border-t">
                <label>Max Number of Guests</label>
                <input type="Number" className="w-full" value={numberOfGuests} onChange={ev => setNumberOfGuests(ev.target.value)} />
              </div>
              <div>
                {numberOfNights > 0 && (
                  <div className="py-3 px-4 border-t">
                  <label>Your full name</label>
                  <input type="text" className="w-full" value={name} onChange={ev => setName(ev.target.value)} />
                  <label>Enter your phone number</label>
                  <input type="tel" className="w-full" value={phone} onChange={ev => setPhone(ev.target.value)} />
                </div>
                )}
              </div>
            </div>
            <button onClick={bookThisPlace} className="primary">
              Book this place 
              {numberOfNights > 0 && (
                <span> - ₹{numberOfNights * place.price}</span>
              )}
            </button>
          </div>
    );
}
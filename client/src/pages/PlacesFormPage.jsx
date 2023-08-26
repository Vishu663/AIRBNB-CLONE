import PhotosUploader from "../PhotosUploader";
import Perks from "../Perks";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";

export default function PlacesFormPage() {
  const {id} = useParams();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [addedPhotos,setAddedPhotos] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [redirect,setRedirect] = useState(false);
  const [price,setPrice] = useState(100);
  useEffect(() => {
    if(!id) {
      return;
    }
    axios.get('/places/'+id).then(response => {
      const {data} = response;
      setTitle(data.title);
      setAddress(data.address);
      setAddedPhotos(data.photos);
      setDescription(data.description);
      setPerks(data.perks);
      setExtraInfo(data.extraInfo);
      setCheckIn(data.checkIn);
      setCheckOut(data.checkOut);
      setMaxGuests(data.maxGuests);
      setPrice(data.price);
    });
  }, [id]);
  function inputHeader(text) {
    return <h2 className="text-xl mt-4">{text}</h2>;
  }

  function inputDescription(text) {
    return <p className="text-gray-500 text-sm">{text}</p>;
  }

  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  async function savePlace(ev) {
    ev.preventDefault();
    const placeData = {title, 
    address, addedPhotos, description, 
    perks, extraInfo, checkIn, 
    checkOut, maxGuests, price};
    if (id) {
      // update
      const {data} = await axios.put('/places', {
        id, ...placeData
      });
      setRedirect(true);
    }
    else {
      const {data} = await axios.post('/places', placeData);
      setRedirect(true);
    }
    
  }


  if(redirect) {
    return <Navigate to={'/account/places'} />
  }



    return (
        <div>
            <AccountNav />
        <form encType="multipart/form-data" onSubmit={savePlace}>
          {preInput("Title", "Please give a name to your place")}
          <input
            type="text"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            placeholder="title"
          />
          {preInput("Address", "Please mention the complete address here")}
          <input
            type="text"
            value={address}
            onChange={(ev) => setAddress(ev.target.value)}
            placeholder="address"
          />
          {preInput("Photos", "More photos make your listing appealing")}
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
          {preInput("Description", "Write a short description about the place")}
          <textarea
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          />  
          {preInput("Perks", "Select all the perks here")}
          <div className="grid gird-cols-2 md:grid-cols-3">
            <Perks selected={perks} onChange={setPerks} />
          </div>
          {preInput('Extra Info', 'House Rules, etc')}
                <textarea
                    value={extraInfo}
                    onChange={ev => setExtraInfo(ev.target.value)} />
          {preInput(
            "Check IN & Check OUT",
            "Please mention the CHECK IN and CHECK OUT time and remember to keep some time gap in between for cleaning the rooms after the guests leave"
          )}
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <div>
                        <h3 className="mt-2 -mb-1">Check in Time </h3>
                        <input type="text"
                            value={checkIn}
                            onChange={ev => setCheckIn(ev.target.value)}
                            placeholder="11:00 AM" />
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">Check Out Time </h3>
                        <input type="text" value={checkOut}
                            onChange={ev => setCheckOut(ev.target.value)}
                            placeholder="12:00 PM" />
                    </div>
            <div>
              <h3 className="mt-2 -mb-1">Max Guests</h3>
              <input
                type="number"
                value={maxGuests}
                onChange={(ev) => setMaxGuests(ev.target.value)}
                placeholder="Mention the maximum number of guests allowed"
              />
            </div>
            <div>
              <h3 className="mt-2 -mb-1">Price</h3>
              <input
                type="number"
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
                placeholder="Mention the maximum number of guests allowed"
              />
            </div>
          </div>
          <div>
            <button className="primary my-4">Save</button>
          </div>
        </form>
      </div> 
    );
}
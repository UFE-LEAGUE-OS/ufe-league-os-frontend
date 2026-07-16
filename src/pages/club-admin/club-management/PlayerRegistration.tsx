import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowRightLeft,
  X,
} from "lucide-react";

import "../../../styles/pages/club-admin/ClubManagement.css";


interface Player {

  id:number;

  clubId:number;

  name:string;

  team:string;

  position:string;

  jersey:number;

  status:"Active" | "Inactive";

}




// Example data from KCCA FC only

const playersData:Player[]=[

{
 id:1,
 clubId:1,
 name:"John Okello",
 team:"Senior Men",
 position:"Midfielder",
 jersey:8,
 status:"Active"
},


{
 id:2,
 clubId:1,
 name:"Allan Okello",
 team:"Senior Men",
 position:"Forward",
 jersey:9,
 status:"Active"
},


{
 id:3,
 clubId:1,
 name:"Faith Nankya",
 team:"Senior Women",
 position:"Forward",
 jersey:11,
 status:"Active"
}


];





const PlayerRegistration =()=>{


const [players,setPlayers]=
useState<Player[]>(playersData);



const [search,setSearch]=
useState("");



// This will come from authentication later

const loggedInClub={

id:1,

name:"KCCA FC",

sport:"Football"

};





const [showForm,setShowForm]=
useState(false);



const [showTransfer,setShowTransfer]=
useState(false);






// Only this club's players

const filteredPlayers = players.filter((player)=>{


return (

player.clubId === loggedInClub.id &&

player.name
.toLowerCase()
.includes(search.toLowerCase())

);


});







const deletePlayer=(id:number)=>{


setPlayers(

players.filter(

(player)=>
player.id !== id

)

);


};






return (

<div className="club-page">





<div className="club-header">


<div>


<h1>

{loggedInClub.name}

</h1>


<p>

{loggedInClub.sport} Player Registration

</p>


</div>




<button

className="primary-btn"

onClick={()=>setShowForm(true)}

>

<Plus size={18}/>

Register Player

</button>



</div>







<div className="club-toolbar">


<div className="search-box">


<Search size={18}/>


<input

placeholder="Search players..."

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

/>


</div>


</div>









<div className="club-card">


<div className="table-wrapper">



<table className="club-table">


<thead>

<tr>

<th>
Player
</th>


<th>
Team
</th>


<th>
Position
</th>


<th>
Jersey
</th>


<th>
Status
</th>


<th>
Actions
</th>


</tr>


</thead>





<tbody>


{

filteredPlayers.map((player)=>(


<tr key={player.id}>


<td>

<strong>

{player.name}

</strong>

</td>



<td>

{player.team}

</td>




<td>

{player.position}

</td>




<td>

{player.jersey}

</td>




<td>


<span className="status active">

{player.status}

</span>


</td>





<td>


<div className="action-buttons">


<button>

<Pencil size={16}/>

</button>



<button

onClick={()=>setShowTransfer(true)}

>

<ArrowRightLeft size={16}/>

</button>




<button

onClick={()=>deletePlayer(player.id)}

>

<Trash2 size={16}/>

</button>



</div>


</td>




</tr>


))


}



</tbody>



</table>



</div>



</div>









{
showForm && (

<div className="modal-overlay">


<div className="club-modal">



<div className="modal-header">


<h2>
Register Player
</h2>


<button

onClick={()=>setShowForm(false)}

>

<X/>

</button>


</div>





<div className="form-grid">


<input

placeholder="Player Name"

/>




<div className="readonly-field">

Club: {loggedInClub.name}

</div>



<div className="readonly-field">

Sport: {loggedInClub.sport}

</div>




<input

placeholder="Team"

/>




<input

placeholder="Position"

/>




<input

type="number"

placeholder="Jersey Number"

/>




<select>


<option>

Active

</option>


<option>

Inactive

</option>


</select>



</div>







<div className="modal-actions">


<button

className="secondary-btn"

onClick={()=>setShowForm(false)}

>

Cancel

</button>



<button

className="primary-btn"

>

Save Player

</button>



</div>




</div>


</div>


)

}









{
showTransfer && (

<div className="modal-overlay">


<div className="club-modal">


<div className="modal-header">


<h2>

Transfer Player

</h2>



<button

onClick={()=>setShowTransfer(false)}

>

<X/>

</button>



</div>





<div className="form-grid">


<input

placeholder="Player Name"

/>



<input

placeholder="Transfer To"

/>




<textarea

placeholder="Reason"

/>




</div>







<div className="modal-actions">


<button

className="secondary-btn"

onClick={()=>setShowTransfer(false)}

>

Cancel

</button>




<button

className="primary-btn"

>

Transfer

</button>



</div>





</div>


</div>


)

}






</div>


);


};


export default PlayerRegistration;
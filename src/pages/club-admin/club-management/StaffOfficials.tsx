import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import "../../../styles/pages/club-admin/clubManagement.css";


interface StaffMember {

  id:number;
  name:string;
  role:string;
  sport:"Football"|"Basketball"|"Rugby";
  team:string;
  phone:string;
  status:"Active"|"Inactive";

}



const staffData:StaffMember[]=[

{
id:1,
name:"John Doe",
role:"Head Coach",
sport:"Football",
team:"Senior Men",
phone:"0700000000",
status:"Active"
},

{
id:2,
name:"Sarah Namusoke",
role:"Physiotherapist",
sport:"Football",
team:"Senior Women",
phone:"0711111111",
status:"Active"
},

{
id:3,
name:"Peter Ojara",
role:"Team Manager",
sport:"Basketball",
team:"Warriors",
phone:"0722222222",
status:"Active"
},

{
id:4,
name:"David Okello",
role:"Coach",
sport:"Rugby",
team:"Rhinos",
phone:"0733333333",
status:"Inactive"
}

];




const roles=[

"Head Coach",
"Assistant Coach",
"Goalkeeping Coach",
"Fitness Coach",
"Team Manager",
"Doctor",
"Physiotherapist",
"Analyst",
"Media Officer",
"Kit Manager",
"Club Secretary"

];





const StaffOfficials =()=>{


const [staff,setStaff]=useState(staffData);


const [search,setSearch]=useState("");


const [showModal,setShowModal]=useState(false);



const filteredStaff =
staff.filter(member=>

member.name
.toLowerCase()
.includes(search.toLowerCase())

);





const deleteStaff=(id:number)=>{

setStaff(

staff.filter(
member=>member.id!==id
)

);

};





return (

<div className="club-page">



<div className="club-header">


<div>

<h1>
Staff & Officials
</h1>


<p>
Manage coaches, officials and club technical staff.
</p>


</div>



<button

className="primary-btn"

onClick={()=>setShowModal(true)}

>

<Plus size={18}/>

Add Staff

</button>



</div>






<div className="club-toolbar">


<div className="search-box">


<Search size={18}/>


<input

placeholder="Search staff..."

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
Name
</th>


<th>
Role
</th>


<th>
Sport
</th>


<th>
Team
</th>


<th>
Phone
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

filteredStaff.map(member=>(


<tr key={member.id}>


<td>

<strong>

{member.name}

</strong>

</td>



<td>

{member.role}

</td>




<td>

<span className="sport-badge">

{member.sport}

</span>

</td>




<td>

{member.team}

</td>




<td>

{member.phone}

</td>




<td>

<span className="status active">

{member.status}

</span>

</td>




<td>


<div className="action-buttons">


<button>

<Pencil size={16}/>

</button>




<button

onClick={()=>
deleteStaff(member.id)
}

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

showModal && (


<div className="modal-overlay">


<div className="club-modal">


<div className="modal-header">


<h2>
Add Staff Member
</h2>


<button

onClick={()=>
setShowModal(false)
}

>

<X/>

</button>


</div>





<div className="form-grid">


<input

placeholder="Full Name"

/>




<select>


{

roles.map(role=>(

<option key={role}>

{role}

</option>

))

}


</select>





<select>

<option>
Football
</option>

<option>
Basketball
</option>

<option>
Rugby
</option>

</select>





<input

placeholder="Assigned Team"

/>





<input

placeholder="Phone Number"

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

onClick={()=>
setShowModal(false)
}

>

Cancel

</button>



<button

className="primary-btn"

>

Save Staff

</button>


</div>



</div>


</div>


)

}



</div>

);


};


export default StaffOfficials;
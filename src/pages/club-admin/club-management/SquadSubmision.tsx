import { useState } from "react";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Send,
} from "lucide-react";

import "../../../styles/pages/club-admin/clubManagement.css";


interface Player {

  id:number;

  clubId:number;

  name:string;

  position:string;

}



interface Official {

  id:number;

  clubId:number;

  name:string;

  role:string;

}





const loggedInClub = {

  id:1,

  name:"KCCA FC",

  sport:"Football"

};





const playersData:Player[]=[


{
id:1,
clubId:1,
name:"John Okello",
position:"Midfielder"
},


{
id:2,
clubId:1,
name:"Allan Okello",
position:"Forward"
},


{
id:3,
clubId:1,
name:"David Peter",
position:"Goalkeeper"
},


{
id:4,
clubId:2,
name:"Brian Kato",
position:"Point Guard"
}


];







const officialsData:Official[]=[


{
id:1,
clubId:1,
name:"John Doe",
role:"Head Coach"
},


{
id:2,
clubId:1,
name:"Sarah Namusoke",
role:"Assistant Coach"
},


{
id:3,
clubId:1,
name:"Peter Ojara",
role:"Team Manager"
},


{
id:4,
clubId:2,
name:"Other Coach",
role:"Coach"
}


];






const SquadSubmission =()=>{



const [step,setStep]=useState(1);



const [selectedPlayers,setSelectedPlayers]=
useState<number[]>([]);



const [selectedOfficials,setSelectedOfficials]=
useState<number[]>([]);






const clubPlayers = playersData.filter(

(player)=>

player.clubId === loggedInClub.id

);





const clubOfficials = officialsData.filter(

(official)=>

official.clubId === loggedInClub.id

);







const togglePlayer=(id:number)=>{


if(selectedPlayers.includes(id)){


setSelectedPlayers(

selectedPlayers.filter(

(item)=>item!==id

)

);


}

else{


setSelectedPlayers([

...selectedPlayers,

id

]);


}


};








const toggleOfficial=(id:number)=>{


if(selectedOfficials.includes(id)){


setSelectedOfficials(

selectedOfficials.filter(

(item)=>item!==id

)

);


}

else{


setSelectedOfficials([

...selectedOfficials,

id

]);


}


};







return(


<div className="club-page">





<div className="club-header">


<div>

<h1>
Squad Sheet Submission
</h1>


<p>

{loggedInClub.name} - {loggedInClub.sport}

</p>


</div>


</div>








<div className="stepper">


{
[1,2,3,4,5].map(number=>(


<div

key={number}

className={
step>=number
?
"step active"
:
"step"
}

>


<span>

{
step>number
?
<Check size={16}/>
:
number
}

</span>


</div>


))

}



</div>









<div className="club-card submission-card">







{
step===1 &&

(

<div>


<h2>
Match Details
</h2>



<div className="form-grid">


<select>

<option>
Uganda Premier League
</option>


<option>
National Cup
</option>


</select>





<select>


<option>
{loggedInClub.name} vs SC Villa
</option>


<option>
Express vs BUL
</option>


</select>



</div>


</div>

)

}









{
step===2 &&


(


<div>


<h2>
Select Players
</h2>


<p>
Players registered under {loggedInClub.name}
</p>




<div className="selection-list">


{

clubPlayers.map(player=>(


<label

key={player.id}

className="selection-item"

>


<input

type="checkbox"

checked={
selectedPlayers.includes(player.id)
}

onChange={()=>
togglePlayer(player.id)
}


/>


<div>


<strong>
{player.name}
</strong>


<br/>


<span>
{player.position}
</span>


</div>



</label>


))


}



</div>



</div>


)

}









{
step===3 &&


(


<div>


<h2>
Assign Officials
</h2>



<div className="selection-list">



{

clubOfficials.map(person=>(


<label

key={person.id}

className="selection-item"

>


<input

type="checkbox"

checked={
selectedOfficials.includes(person.id)
}

onChange={()=>
toggleOfficial(person.id)
}


/>



{person.name}

-
{person.role}



</label>



))


}



</div>



</div>


)

}









{
step===4 &&


(


<div>


<h2>
Squad Confirmation
</h2>



<div className="review-box">


<p>

Club:

<strong>
{loggedInClub.name}
</strong>

</p>



<p>

Sport:

<strong>
{loggedInClub.sport}
</strong>


</p>



<p>

Players Selected:

<strong>
{selectedPlayers.length}
</strong>


</p>



<p>

Officials Selected:

<strong>
{selectedOfficials.length}
</strong>


</p>



</div>



</div>


)

}









{
step===5 &&


(


<div>


<h2>
Submit Squad Sheet
</h2>



<div className="review-box">


<p>
Ready to submit official squad to union.
</p>


</div>




<button

className="primary-btn"

>

<Send size={18}/>

Submit To Union

</button>




</div>


)

}









<div className="wizard-buttons">



<button

className="secondary-btn"

disabled={step===1}

onClick={()=>
setStep(step-1)
}

>


<ChevronLeft/>

Previous


</button>







<button

className="primary-btn"

disabled={step===5}

onClick={()=>
setStep(step+1)
}

>


Next

<ChevronRight/>


</button>




</div>








</div>





</div>



);



};



export default SquadSubmission;
import { httpReq } from './glass-app-utils.js' ;

export class GlassAppMethods {
  dummy = async (data) => {
    try {
      const user = gs.getUser();
      if(!user) throw {status:400,message:"no user provided"};  

      data.id = user.id;
      data.role = `glass-app-user`;
      const body = await httpReq({method:"POST",url:`/glass/verify`,data});
      gs.setUser(body.data);
      window.location.href = `/glass/register`;
    }
    catch(e){console.error(e.message,e);}
  };
  postCronJob = async (data) => {
    try{
      data.id = user.id;
      data.role = `glass-app-user`;
      const body = await httpReq({method:"POST",url:`/glass/jobs`,data,withAuth:true});
      console.log(body);
      //gs.setUser(body.data);
      //window.location.href = `/glass/jobs`;
    }
    catch(e){console.error(e.message,e);}
  };
  testNotification = async (data) => {
    try{
      data.id = user.id;
      data.role = `glass-app-user`;
      const body = await httpReq({method:"POST",url:`/glass/test`,data,withAuth:true});
      console.log(body);
      //gs.setUser(body.data);
      //window.location.href = `/glass/jobs`;
    }
    catch(e){console.error(e.message,e);}
  };
}

/*
if(results.length) for(let i=0;i<results.length;i++){
          const resultStr = `Name: ${results[i].name} Nums: ${results[i].play}`;
          const tdDate = document.createElement("td");
          tdDate.innerHTML = 'Jan 1, 2025'
          
          const tdPlan = document.createElement("td");
          tdPlan.innerHTML = 'Pro Plan - Monthly';
          
          const tdAmt = document.createElement("td");
          tdAmt.innerHTML = `<span class="table-amount">$${29.00}</span>`;
          
          const tdStatus = document.createElement("td");
          tdStatus.innerHTML = `<span class="status-badge completed">Paid</span>`;

          const tdAction = document.createElement("td");
          const a = document.createElement("a");
          a.setAttribute("href","#");
          a.style="color: var(--emerald-light);";
          a.innerHTML = 'Download'
          a.addEventListener("click",e => {console.log("clicked-table-action")})
          tdAction.appendChild(a);
          
          const tr = document.createElement("tr");
          tr.appendChild(tdDate);
          tr.appendChild(tdPlan);
          tr.appendChild(tdAmt);
          tr.appendChild(tdStatus);
          tr.appendChild(tdAction);
          resultsDiv.appendChild(tr);
        }
          */
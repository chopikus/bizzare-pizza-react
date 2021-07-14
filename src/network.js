import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError, finalize } from 'rxjs/operators';

const API_DOMAIN = "192.168.31.41";

class Networker {
    static makeRequest(query, data, saveSecret)
    {
        let s = "http://"+API_DOMAIN+query;
        let map = new Map(Object.entries(data));
        let first = true;
        for (let key of map.keys())
        {
            s+=first?"?":"&";
            s+=key;
            s+="=";
            s+=encodeURIComponent(map.get(key));
            first = false;
        }
        const resp = fromFetch(s).pipe(
            switchMap(response => {
              if (response.ok) {
                // OK return data
                var json = response.json();
                json.then((resp)=>{
                    if (resp.data && resp.data.secret)
                        localStorage['secret'] = resp.data.secret; 
                });
                return json;
              } else {
                // Server is returning a status requiring the client to try something else.
                return of({status: {response: 999, message: `Error ${response.status}` } });
              }
            }),
            catchError(err => {
              // Network or other error, handle appropriately
              return of({status: {response: 1000, message: err.message } });
            }),
            
           );
        return resp;
    }
}

export default Networker;
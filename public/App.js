class System{
    constructor(){

    }
    alert(data){
        try{
            const alertId = "custom-alert";
            const alertHTML = `
                <section class="blbg" id="${alertId}">
                    <div class="alert ${data?.error>=200 && data?.error<= 299?'alert-success':data?.error>=400 && data?.error <= 600?'alert-warning':'alert-danger'}" role="alert">
                        <h4 class="alert-heading">${data?.error>=200 && data?.error<= 299?'Success':'Error'}: ${data?.error} 
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close" onclick="document.getElementById('${alertId}').remove(); ${data?.mute!=true ?'window.location.reload()':''};">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </h4>
                        <p>${data?.message}</p>
                        <hr>
                        <p class="mb-0">If you see this message rapidly or unexpected way then please <a href="mailto:info.aidictionary24x7@gmail.com?subject=Unexpected%20Dialog%20popup%20coming%20in%20SAIT">contact us</a>.</p>
                    </div>
                </section>`;
            document.body.insertAdjacentHTML("beforeend", alertHTML);
        }catch(e){
            alert("Somthin went wrong! \n", e, String(data));
        }
    }
    encoder(plain_txt, key){
        const vocabulary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!*+#%$&^,|?/";
        let cipher = "";
        key = key.repeat(Math.ceil(plain_txt.length / key.length));

        for(let i = 0; i < plain_txt.length; i++){
            let plain_txtIndex = vocabulary.indexOf(plain_txt[i]);
            let keyIndex = vocabulary.indexOf(key[i]);
            if(plain_txtIndex !== -1 && keyIndex !== -1){
                let newIndex = (plain_txtIndex + keyIndex) % vocabulary.length;
                cipher += vocabulary[newIndex];
            } else {
                cipher += plain_txt[i];
            }
        }
        return cipher;
    }
    objEncoder(obj, key='1441'){
        const encrypted = {};
        for (let field in obj) {
            const value = String(obj[field]);
            encrypted[field] = this.encoder(value, key);
        }
        return encrypted;
    }
    copy(id){
        const textToCopy = document.querySelector(id);
        const tempTextarea = document.createElement("textarea");
        tempTextarea.value = textToCopy.textContent;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        tempTextarea.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(tempTextarea);
        alert("Text has been copied to the clipboard!");
    }
    search(search_input_id, sample_space_class, type='list-item', search_key=''){
        let find = 0;
        let miss=0;
        let input = search_key==''?document.getElementById(`${search_input_id}`).value:search_key;
        input = input.toLowerCase();
        let x = document.getElementsByClassName(`${sample_space_class}`);
        for(let i = 0; i<x.length; i++){ 
            if(!x[i].textContent.toLowerCase().includes(input)){
                x[i].style.display = "none";
                miss++;
            }else{
                x[i].style.display = type; //list-item
                find++;
            }
        }
        if(miss>find && find==0 && miss!=0){
            document.getElementById(search_input_id+'DOD').style.display = "block";
        }else{
            document.getElementById(search_input_id+'DOD').style.display = "none";
        }
    }

    async getLegalContent(viewId = 0){
        try{
            const response = await fetch('/security', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/html'
                },
                body: JSON.stringify({ view: viewId }),

            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const htmlContent = await response.text();
            const blbgDiv = document.createElement('div');
            blbgDiv.className = 'blbg';
            const legalSection = document.createElement('section');
            legalSection.id = 'legalDoc';
            blbgDiv.appendChild(legalSection);
            legalSection.innerHTML = htmlContent;

            document.body.appendChild(blbgDiv);

            if(viewId>1){
                document.querySelector('.license').innerText = document.querySelector('.license').textContent;
            }
        }catch(error){
            console.error('Error fetching legal content:', error);
            this.alert({'error': 500, 'message': "Failed to load the security content due to some unexpted error. Please try again some time later."})
        }
    }
    closeLegalContent(){
        const blbgElements = document.querySelectorAll('.blbg');
        blbgElements.forEach(el => {
            if (el.querySelector('#legalDoc')) {
                el.remove();
            }
        });
    }
}

let system;
document.addEventListener("DOMContentLoaded",() => {
    system = new System();

    const urlParams = new URLSearchParams(window.location.search);
    if (window.self !== window.top || urlParams.get('fromApp') === 'sankhyai') {
        const style = document.createElement('style');
        style.textContent = `
        body { width: 100%; overflow: hidden !important; }
        
        `;
        document.head.appendChild(style);
        console.log("App container layout styles applied natively by the server.");
    }
});

function route(link) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const fromApp = params.get('fromApp');

    if (token) {
        try {
            const urlObj = new URL(link, window.location.origin);
            
            urlObj.searchParams.set('token', token);
            if (fromApp) {
                urlObj.searchParams.set('fromApp', fromApp);
            }
            
            link = urlObj.pathname + urlObj.search + urlObj.hash;
        } catch (e) {
            const separator = link.includes('?') ? '&' : '?';
            link = link + separator + "token=" + encodeURIComponent(token);
            if (fromApp) link = link + "&fromApp=" + encodeURIComponent(fromApp);
        }
    }
    
    window.location.href = link;
}



function invalid(){
    alert("This feature is not present on this version or you are not permitted to access this resource from this site, Please wait until the new version release or contact us for permission");
}


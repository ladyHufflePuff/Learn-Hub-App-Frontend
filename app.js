let app = new Vue({
    el:'#app',
    data:{
        lessons: [],
        showSidebar: false,
        selectedSort: [],
        order: 'ascending',
        cart:[],
        showLesson: true,
        name: '',
        phone: '',
        nameError: false,
        phoneError: false,
        modalShow: false,
        searchQuery: '',
        searchResults: []
    },
    created:function(){
        // fetch lessons from backend
        fetch("https://learn-hub-app-api.onrender.com/lessons").then( (res) =>{
            res.json().then(
                (res) =>{
                    app.lessons = res;
                }
            )
        });
        // load cart from localStorage
        storedCart = localStorage.getItem('cart');
        if (storedCart){
            this.cart = JSON.parse(storedCart);
        }
    },
    // monitor changes to cart and update localstorage
    watch:{
        cart:{
            deep: true, // ensure nested changes are monitored
            handler(newCart){
                localStorage.setItem('cart', JSON.stringify(newCart))
            }
        }
    },
    methods:{
        // toggle sidebar visibility
        toggleSidebar(){
            this.showSidebar = !this.showSidebar; 
        },
        // update selected sorting attribute
        handleSort(attribute){
            this.selectedSort = [attribute];
        },
        // update lesson spaces in backend
        async updateSpace(lessonId, spaceChange) {
            const lesson = this.lessons.find(l => l.id === lessonId);
            if (lesson) {
                lesson.space += spaceChange;
                try {
                    await fetch(`https://learn-hub-app-api.onrender.com/lessons/${lesson._id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ space: lesson.space })
                    });
                } catch (error) {
                    console.error(`Failed to update lesson ${lesson.subject}:`, error);
                    lesson.space -= spaceChange; 
                }
            }
        },
        // add lesson to cart
        async addToCart(lesson){
            let cartItem = this.cart.find(item => item.id === lesson.id);
            if(cartItem){
                cartItem.quantity += 1;
            }else{
                this.cart.push({id: lesson.id, quantity: 1});
            }
            await this.updateSpace(lesson.id, -1);
            if (this.searchResults.some(searchResult => searchResult.id === lesson.id)) {
                await this.searchLessons();
            }
        },
        // toggle lesson and shopping cart page
        showCheckout(){
            this.showLesson = !this.showLesson;  
            this.searchQuery = '';
        },
        // get quantity of specific lesson in cart
        cartQuantity(lessonId){
            let cartItem = this.cart.find(item => item.id === lessonId);
            return cartItem ? cartItem.quantity : 0;
        },
        // remove lesson from cart
        async removeFromCart(lesson){
            let cartItem = this.cart.find(item => item.id === lesson.id);
            if (cartItem) {
                cartItem.quantity -= 1; 
                if (cartItem.quantity === 0) {
                    this.cart = this.cart.filter(item => item.id !== lesson.id);
                }
            }
            await this.updateSpace(lesson.id, 1);        
        },
        // validate name input
        validateName(){
            const nameRegex = /^[a-zA-Z\s]*$/;
            if (!nameRegex.test(this.name)) {
              this.nameError = true;
            } else {
              this.nameError = false;
            }
        },
        // validate phone number input
        validatePhone(){
            const phoneRegex = /^[0-9]*$/;
            if (!phoneRegex.test(this.phone)) {
              this.phoneError = true;
            } else {
              this.phoneError = false;
            }  
        },
        // submit order to backend and display confirmation message
        confirmOrder(){
            if (this.isFormValid) {
                const order ={
                    name: this.name,
                    phone: this.phone,
                    lessons: this.cart.map(item => ({ id: item.id, space: item.quantity })),
                    orderDate: new Date().toISOString().slice(0, 10) 
                };
                fetch("https://learn-hub-app-api.onrender.com/orders", {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(order)
                })
                .then(response => {
                    if (response.ok) {
                        this.modalShow = true; 
                    } else {
                        console.error("Failed to submit order");
                    }
                });
              }
        },
        // reset shopping cart page after order confirmation
        dismiss(){
            this.modalShow = false;
            this.cart = [];  
            this.name = '';
            this.phone = '';  
        },
        // search for lesson based on user input
        async searchLessons(){
            const res = await fetch(`https://learn-hub-app-api.onrender.com/lessons/search?search=${encodeURIComponent(this.searchQuery)}`);
            if (res.status == 200){
                const results = await res.json();
                this.searchResults = results;
            }
            else if (res.status == 205){
                return app.lessons; 
            }
            else{
                console.error("Failed to fetch search results, status code:", res.status);
            }
        }
    },
    computed:{
        // return lessons sorted by selected attribute and order
        sortedLessons(){
            if(this.selectedSort.length === 0){
                return this.lessons;
            }
            return this.lessons.slice().sort((a,b) =>{
                let modifier = this.order === 'ascending' ? 1: -1;
                if (a[this.selectedSort[0]] < b[this.selectedSort[0]]) return -1 * modifier;
                if (a[this.selectedSort[0]] > b[this.selectedSort[0]]) return 1 * modifier;
                return 0;
            })
        },
        // calculate total number of lessons in cart
        itemInCart(){
            return this.cart.reduce((total, item) => total + item.quantity, 0);
        },
        // full details of lessons in cart
        cartLessons(){
            return this.lessons.filter(lesson => this.cart.some(item => item.id === lesson.id));
        },
        // validate checkout information
        isFormValid(){
            return !this.nameError && !this.phoneError && this.name !=='' && this.phone !== '';
        },
        // determine checkout button activity
        isShoppingCartDisabled() {
            return this.showLesson && this.cart.length === 0;
        }
    }

})
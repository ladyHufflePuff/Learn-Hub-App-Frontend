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
        fetch("http://localhost:8080/lessons").then( (res) =>{
            res.json().then(
                (res) =>{
                    app.lessons = res;
                }
            )
        });
        storedCart = localStorage.getItem('cart');
        if (storedCart){
            this.cart = JSON.parse(storedCart);
        }
    },
    watch:{
        cart:{
            deep: true,
            handler(newCart){
                localStorage.setItem('cart', JSON.stringify(newCart))
            }
        }
    },
    methods:{
        toggleSidebar(){
            this.showSidebar = !this.showSidebar; 
        },
        handleSort(attribute){
            this.selectedSort = [attribute];
        },
        async updateSpace(lessonId, spaceChange) {
            const lesson = this.lessons.find(l => l.id === lessonId);
            if (lesson) {
                lesson.space += spaceChange;
                try {
                    await fetch(`http://localhost:8080/lessons/${lesson._id}`, {
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
        showCheckout(){
            this.showLesson = !this.showLesson;  
            this.searchQuery = '';
        },
        cartQuantity(lessonId){
            let cartItem = this.cart.find(item => item.id === lessonId);
            return cartItem ? cartItem.quantity : 0;
        },
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
        validateName(){
            const nameRegex = /^[a-zA-Z\s]*$/;
            if (!nameRegex.test(this.name)) {
              this.nameError = true;
            } else {
              this.nameError = false;
            }
        },
        validatePhone(){
            const phoneRegex = /^[0-9]*$/;
            if (!phoneRegex.test(this.phone)) {
              this.phoneError = true;
            } else {
              this.phoneError = false;
            }  
        },
        confirmOrder(){
            if (this.isFormValid) {
                const order ={
                    name: this.name,
                    phone: this.phone,
                    lessons: this.cart.map(item => ({ id: item.id, space: item.quantity })),
                    orderDate: new Date().toISOString().slice(0, 10) 
                };
                fetch("http://localhost:8080/orders", {
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
        dismiss(){
            this.modalShow = false;
            this.cart = [];  
            this.name = '';
            this.phone = '';  
        },
        async searchLessons(){
            const res = await fetch(`http://localhost:8080/lessons/search?search=${encodeURIComponent(this.searchQuery)}`);
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
        itemInCart(){
            return this.cart.reduce((total, item) => total + item.quantity, 0);
        },
        cartLessons(){
            return this.lessons.filter(lesson => this.cart.some(item => item.id === lesson.id));
        },
        isFormValid(){
            return !this.nameError && !this.phoneError && this.name !=='' && this.phone !== '';
        },
        isShoppingCartDisabled() {
            return this.showLesson && this.cart.length === 0;
        }
    }

})
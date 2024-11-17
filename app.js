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
        modalShow: false
    },
    created:function(){
        fetch("http://localhost:8080/lessons").then( (res) =>{
            res.json().then(
                (res) =>{
                    app.lessons = res;
                }
            )
        })
    },
    methods:{
        toggleSidebar(){
            this.showSidebar = !this.showSidebar; 
        },
        handleSort(attribute){
            this.selectedSort = [attribute];
        },
        addToCart(lesson){
            let cartItem = this.cart.find(item => item.id === lesson.id);
            if(cartItem){
                cartItem.quantity += 1;
            }else{
                this.cart.push({id: lesson.id, quantity: 1});
            }
            lesson.space--;
        },
        showCheckout(){
            this.showLesson = !this.showLesson;  
        },
        cartQuantity(lessonId){
            let cartItem = this.cart.find(item => item.id === lessonId);
            return cartItem ? cartItem.quantity : 0;
        },
        removeFromCart(lesson){
            let cartItem = this.cart.find(item => item.id === lesson.id);
            if (cartItem) {
                cartItem.quantity -= 1; 
                lesson.space++; 
                if (cartItem.quantity === 0) {
                    this.cart = this.cart.filter(item => item.id !== lesson.id);
                }
            }
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
                this.modalShow = true; 
              }
        },
        dismiss(){
            this.modalShow = false;
            this.cart = [];    
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
            return this.showLesson && this.cartLessons.length === 0;
        }
    }

})
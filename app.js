let app = new Vue({
    el:'#app',
    data:{
        lessons: lessons,
        showSidebar: false,
        selectedSort: [],
        order: 'ascending',
        cart:[],
        showLesson: true  
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
        }
    }

})
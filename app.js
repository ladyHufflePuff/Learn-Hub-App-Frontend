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
            if(lesson.space > 0){
                this.cart.push(lesson.id)
                lesson.space--;
            }
        },
        showCheckout(){
            this.showLesson = !this.showLesson;  
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
            return this.cart.length ||"";
        }
    }

})
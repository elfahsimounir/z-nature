export type Product = {
  name: string;
  reviews: any[];
  price: number;
  discount: number;
  discriptio
  id: string;
  slug  :      string  
  description: string   
  isNew     :  boolean
  isPublished    :  boolean
  image    :   string
  stock    :   number

  quantity : number
  category :{
    name: string;
    id:  string;
    image: string;
  }
  brand  :{
    name: string;
    id:  string;
    image: string;
  }
  rating  :   number
  properties :any
  hashtags :any[]
  images: {
    url: string[];
  };
};

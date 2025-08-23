// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   OneToMany,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { ProductCategory } from '../enums/product-category.enum';
// import { Complex } from '../../complex/entities/complex.entity';
// import { ProductSale } from '../../sales/entities/product-sale.entity';
// import { InventoryMovement } from '../../inventory/entities/inventory-movement.entity';

// @Entity()
// export class Product {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   name: string;

//   @Column({ nullable: true })
//   description: string;

//   @Column({ nullable: true, unique: true })
//   barcode: string;

//   @Column({
//     type: 'enum',
//     enum: ProductCategory,
//   })
//   category: ProductCategory;

//   @Column({ default: 0 })
//   stock: number;

//   @Column('float')
//   costPrice: number;

//   @Column('float')
//   salePrice: number;

//   @Column({ default: 5 })
//   minStock: number;

//   @Column({ nullable: true })
//   supplier: string;

//   @Column({ default: true })
//   isActive: boolean;

//   @ManyToOne(() => Complex, (complex) => complex.products)
//   complex: Complex;

//   @Column()
//   complexId: string;

//   @OneToMany(() => ProductSale, (productSale) => productSale.product)
//   sales: ProductSale[];

//   @OneToMany(() => InventoryMovement, (movement) => movement.product)
//   movements: InventoryMovement[];

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }

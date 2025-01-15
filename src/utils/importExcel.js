const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const prisma = new PrismaClient();

async function importExcelData() {
    try {
        // Leer el archivo Excel
        const workbook = XLSX.readFile('Inventario 2025.xlsx');
        
        // Para cada hoja en el Excel
        for (const sheetName of workbook.SheetNames) {
            // Obtener la categoría o crearla si no existe
            const category = await prisma.category.upsert({
                where: { name: sheetName },
                update: {},
                create: {
                    name: sheetName,
                    description: `Productos de categoría ${sheetName}`
                }
            });

            // Convertir la hoja a JSON
            const sheet = workbook.Sheets[sheetName];
            const products = XLSX.utils.sheet_to_json(sheet);

            // Procesar cada producto
            for (const product of products) {
                if (product.DESCRIPCION && product['CODIGO DE BARRA']) {
                    try {
                        await prisma.product.create({
                            data: {
                                code: product['CODIGO DE BARRA'].toString(),
                                name: product.DESCRIPCION,
                                purchasePrice: product['P. COMPRA'] || 0,
                                salePrice: product['P. VENTA'] || 0,
                                stock: product.CANT || 0,
                                minStock: 5,
                                categoryId: category.id
                            }
                        });
                        console.log(`Producto importado: ${product.DESCRIPCION}`);
                    } catch (error) {
                        // Si el producto ya existe (por código de barra duplicado), lo ignoramos
                        if (error.code === 'P2002') {
                            console.log(`Producto ya existe: ${product.DESCRIPCION}`);
                        } else {
                            console.error(`Error importando producto ${product.DESCRIPCION}:`, error);
                        }
                    }
                }
            }
        }
        console.log('Importación completada');
    } catch (error) {
        console.error('Error en la importación:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importExcelData();
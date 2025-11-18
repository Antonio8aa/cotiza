import { jsPDF } from "jspdf"

export async function generateCotizacionPDF(cotizacion: any): Promise<Buffer> {
  try {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text("GRUPO LITE", 20, 20)
    doc.setFontSize(16)
    doc.text("COTIZACIÓN", 20, 30)

    // Información de la cotización
    doc.setFontSize(12)
    doc.text(`Número: ${cotizacion.numero_cotizacion}`, 20, 45)
    doc.text(`Fecha: ${new Date(cotizacion.fecha_creacion).toLocaleDateString()}`, 20, 52)
    doc.text(`Estado: ${cotizacion.estado}`, 20, 59)

    // Información del cliente
    doc.setFontSize(14)
    doc.text("DATOS DEL CLIENTE", 20, 75)
    doc.setFontSize(12)
    doc.text(`Nombre: ${cotizacion.cliente_nombre}`, 20, 85)
    if (cotizacion.cliente_email) {
      doc.text(`Email: ${cotizacion.cliente_email}`, 20, 92)
    }
    if (cotizacion.cliente_telefono) {
      doc.text(`Teléfono: ${cotizacion.cliente_telefono}`, 20, 99)
    }
    if (cotizacion.cliente_empresa) {
      doc.text(`Empresa: ${cotizacion.cliente_empresa}`, 20, 106)
    }

    // Tabla de productos
    let yPosition = 125
    doc.setFontSize(14)
    doc.text("PRODUCTOS", 20, yPosition)
    yPosition += 10

    // Headers de la tabla
    doc.setFontSize(10)
    doc.text("Código", 20, yPosition)
    doc.text("Producto", 50, yPosition)
    doc.text("Cant.", 120, yPosition)
    doc.text("Precio Unit.", 140, yPosition)
    doc.text("Subtotal", 170, yPosition)
    yPosition += 7

    // Línea separadora
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 5

    // Productos
    cotizacion.detalles.forEach((detalle: any) => {
      doc.text(detalle.producto.codigo || "", 20, yPosition)
      doc.text(detalle.producto.nombre.substring(0, 25) || "", 50, yPosition)
      doc.text(detalle.cantidad.toString(), 120, yPosition)
      doc.text(`$${detalle.precio_unitario.toFixed(2)}`, 140, yPosition)
      doc.text(`$${detalle.subtotal.toFixed(2)}`, 170, yPosition)
      yPosition += 7
    })

    // Total
    yPosition += 5
    doc.line(140, yPosition, 190, yPosition)
    yPosition += 7
    doc.setFontSize(12)
    doc.text(`TOTAL: $${cotizacion.total.toFixed(2)}`, 140, yPosition)

    // Observaciones
    if (cotizacion.observaciones) {
      yPosition += 15
      doc.setFontSize(12)
      doc.text("OBSERVACIONES:", 20, yPosition)
      yPosition += 7
      doc.setFontSize(10)
      const splitText = doc.splitTextToSize(cotizacion.observaciones, 170)
      doc.text(splitText, 20, yPosition)
    }

    // Convertir a Buffer
    const pdfOutput = doc.output("arraybuffer")
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error("Error generando PDF:", error)
    throw error
  }
}

export async function generateCotizacionPDFHorizontal(cotizacion: any): Promise<Buffer> {
  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "letter"
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(30, 30, 30)
    doc.text("grupolite", pageWidth - 50, 15)

    // Company info section
    let yPosition = 30

    // Left column - Company and client info
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    // Cotización number and date
    doc.setFontSize(9)
    doc.text(`Cotización: ${cotizacion.numero_cotizacion}`, 15, yPosition)
    doc.text(`Fecha: ${new Date(cotizacion.fecha_creacion).toLocaleDateString("es-MX")}`, 15, yPosition + 5)
    doc.text(`Estado: ${cotizacion.estado.toUpperCase()}`, 15, yPosition + 10)

    // Client info section
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("CLIENTE:", 15, yPosition + 20)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(cotizacion.cliente_nombre, 15, yPosition + 25)
    if (cotizacion.cliente_empresa) {
      doc.text(cotizacion.cliente_empresa, 15, yPosition + 30)
    }
    if (cotizacion.cliente_email) {
      doc.text(`Email: ${cotizacion.cliente_email}`, 15, yPosition + 35)
    }
    if (cotizacion.cliente_telefono) {
      doc.text(`Tel: ${cotizacion.cliente_telefono}`, 15, yPosition + 40)
    }

    // Right column - Quote info
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("INFORMACIÓN DE COTIZACIÓN:", pageWidth / 2 + 10, yPosition + 20)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Usuario: ${cotizacion.usuario?.nombre || ""}`, pageWidth / 2 + 10, yPosition + 25)
    doc.text(`Utilidad: ${cotizacion.utilidad?.nombre || ""}`, pageWidth / 2 + 10, yPosition + 30)
    doc.text(`Forma de Pago: ${cotizacion.forma_pago?.nombre || ""}`, pageWidth / 2 + 10, yPosition + 35)
    if (cotizacion.proyecto_nombre) {
      doc.text(`Proyecto: ${cotizacion.proyecto_nombre}`, pageWidth / 2 + 10, yPosition + 40)
    }

    // Products table
    yPosition = 85

    // Table headers
    const colWidths = {
      clave: 12,
      cant: 12,
      imagen: 12,
      catalogo: 18,
      descripcion: 50,
      marca: 18,
      acabado: 12,
      mxn: 12,
      te: 10,
      pu: 12,
      importe: 16
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    
    let xPos = 15
    const headers = [
      { text: "CLAVE", width: colWidths.clave },
      { text: "CANT", width: colWidths.cant },
      { text: "IMAGEN", width: colWidths.imagen },
      { text: "CATÁLOGO", width: colWidths.catalogo },
      { text: "DESCRIPCIÓN", width: colWidths.descripcion },
      { text: "MARCA", width: colWidths.marca },
      { text: "ACABADO", width: colWidths.acabado },
      { text: "MXN", width: colWidths.mxn },
      { text: "T.E.", width: colWidths.te },
      { text: "P.U.", width: colWidths.pu },
      { text: "IMPORTE", width: colWidths.importe }
    ]

    doc.setDrawColor(200, 200, 200)
    doc.line(15, yPosition - 5, pageWidth - 15, yPosition - 5)
    
    for (const header of headers) {
      doc.text(header.text, xPos + header.width / 2, yPosition - 1, { maxWidth: header.width - 1, align: "center" })
      xPos += header.width
    }
    
    doc.line(15, yPosition + 1, pageWidth - 15, yPosition + 1)

    // Table data
    yPosition += 3
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    cotizacion.detalles.forEach((detalle: any, index: number) => {
      xPos = 15
      doc.setFontSize(6.5)

      const columns = [
        { text: detalle.producto?.codigo || "-", width: colWidths.clave },
        { text: detalle.cantidad.toString(), width: colWidths.cant },
        { text: "[IMG]", width: colWidths.imagen }, // Image placeholder
        { text: detalle.producto?.nombre.substring(0, 12) || "-", width: colWidths.catalogo },
        { text: (detalle.producto?.descripcion || "-").substring(0, 35), width: colWidths.descripcion },
        { text: detalle.producto?.marca?.nombre || "-", width: colWidths.marca },
        { text: "-", width: colWidths.acabado },
        { text: "-", width: colWidths.mxn },
        { text: detalle.tiempo_entrega || "-", width: colWidths.te },
        { text: `$${detalle.precio_unitario.toFixed(2)}`, width: colWidths.pu },
        { text: `$${detalle.subtotal.toFixed(2)}`, width: colWidths.importe }
      ]

      for (const col of columns) {
        doc.text(col.text, xPos + col.width / 2, yPosition, { maxWidth: col.width - 1, align: "center" })
        xPos += col.width
      }

      yPosition += 6
    })

    yPosition += 10
    const rightMargin = pageWidth - 15
    const labelX = rightMargin - 55
    const valueX = rightMargin
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    const currencySymbol = cotizacion.moneda === 'USD' ? '$' : '$'
    const currencyCode = cotizacion.moneda || 'MXN'
    
    // Subtotal
    doc.setFont("helvetica", "normal")
    doc.text("Subtotal:", labelX, yPosition, { align: "left" })
    doc.text(`${currencySymbol}${cotizacion.subtotal.toFixed(2)}`, valueX, yPosition, { align: "right" })

    yPosition += 6
    
    // IVA
    const iva = cotizacion.total - cotizacion.subtotal
    doc.text("IVA:", labelX, yPosition, { align: "left" })
    doc.text(`${currencySymbol}${iva.toFixed(2)}`, valueX, yPosition, { align: "right" })

    yPosition += 6
    
    // Total
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(`Total (${currencyCode}):`, labelX, yPosition, { align: "left" })
    doc.text(`${currencySymbol}${cotizacion.total.toFixed(2)}`, valueX, yPosition, { align: "right" })

    yPosition += 15
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    if (cotizacion.ubicacion_entrega) {
      doc.text("Entrega:", 15, yPosition)
      doc.setFont("helvetica", "normal")
      doc.text(cotizacion.ubicacion_entrega, 35, yPosition)
      yPosition += 6
    }

    doc.setFont("helvetica", "bold")
    doc.text("Forma de Pago:", 15, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(cotizacion.forma_pago?.nombre || "", 40, yPosition)
    yPosition += 6

    doc.setFont("helvetica", "bold")
    doc.setTextColor(220, 0, 0)
    doc.text("No se aceptan cambios", 15, yPosition)

    // Footer
    const footerY = pageHeight - 8
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    doc.text("grupolite.com", 15, footerY)
    doc.text("Pag. 1 de 1", pageWidth - 25, footerY, { align: "right" })

    // Convertir a Buffer
    const pdfOutput = doc.output("arraybuffer")
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error("Error generando PDF horizontal:", error)
    throw error
  }
}

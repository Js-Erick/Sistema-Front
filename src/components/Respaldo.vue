<template>

    <template slot="items" slot-scope="props">
        <td>{{ item.usuario }}</td>
        <td>{{ item.idproveedorNavigation.nombre }}</td>
        <td>{{ item.tipoComprobante }}</td>
        <td>{{ item.serieComprobante}}</td>
        <td>{{ item.numComprobante }}</td>
        <td>{{ item.fechaHora }}</td>
        <td>{{ item.impuesto }}</td>
        <td>{{ item.total }}</td>
        </template>

    <template v-slot:item.subTotal="props">
        <td>
        <v-text-field
            type="number"
            single-line
            v-model.number="props.item.subTotal"
            readonly
        >{{props.item.subTotal = calcularSubTotal(props.item.cantidad, props.item.precio) }}</v-text-field>
        </td>
    </template>

</template>
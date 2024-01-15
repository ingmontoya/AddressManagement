<script setup>
import { ref, watch, onMounted, reactive } from 'vue';
import axios from 'redaxios';
import { useAddressStore } from '@/stores/addressStore';

const addressStore = useAddressStore();

const dialog = ref(false);
const dialogDelete = ref(false);
const headers = [
  { title: 'Street address', key: 'street' },
  { title: 'Apt, suite, etc', key: 'addressLine' },
  { title: 'City', key: 'city' },
  { title: 'State / Province', key: 'state' },
  { title: 'ZIP / Postal Code', key: 'zip' },
  { title: 'Country', key: 'country' },
  { title: 'Actions', key: 'actions', align: 'center' },
];

const address = ref([]);
const editedIndex = ref(-1);

const editedItem = ref({
  search: '',
  street: '',
  addressLine: '',
  city: '',
  state: '',
  zip: '',
  country: '',
});

const defaultItem = reactive({
  search: '',
  street: '',
  addressLine: '',
  city: '',
  state: '',
  zip: '',
  country: '',
});
const tab = ref('one');

watch(dialog, (val) => {
  if (!val) close();
});

watch(dialogDelete, (val) => {
  if (!val) closeDelete();
});

onMounted(() => {
  initialize();
});

const initialize = () => {
  address.value = addressStore.loadAddresses() || [];
};

const editItem = (item) => {
  console.log('item', item);
  editedIndex.value = address.value.indexOf(item);
  editedItem.value = { ...item };
  dialog.value = true;
};

const deleteItem = (item) => {
  editedIndex.value = address.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
  addressStore.deleteAddress(address.value.indexOf(item));
};

const deleteItemConfirm = () => {
  address.value.splice(editedIndex.value, 1);
  closeDelete();
};

const close = () => {
  dialog.value = false;
  editedItem.value = { ...defaultItem.value };
  editedIndex.value = -1;
};

const closeDelete = () => {
  dialogDelete.value = false;
  editedItem.value = { ...defaultItem.value };
  editedIndex.value = -1;
};

const save = () => {
  if (editedIndex.value > -1) {
    addressStore.updateAddress(editedIndex.value, { ...editedItem.value });

  } else {
    console.log('item', editedItem.value);
    addressStore.addAddress({ ...editedItem.value });

  }
  close();
};

const Key = 'RH25-CW45-RJ99-FF86';
const url = 'http://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws';

const autocompleteOptions = ref({
  Items: [],
});

const searchAddress = async () => {
  try {
    const params = new URLSearchParams({
      Key,
      SearchTerm: editedItem.value.search,
    });

    const response = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    autocompleteOptions.value.Items = response.data.Items;

    console.log('Respuesta del servidor:', response.data);
    // console.log('editedItem.value.search', autocompleteOptions.value.Items.filter(el => el.Text === 'editedItem.value.search'));

  } catch (error) {
    console.error('Error en la solicitud POST:', error);
  }
};

const setupValues = async () => {
  console.log(autocompleteOptions.value.Items.filter(el => el.Text === editedItem.value.search));
  const selectedItem = autocompleteOptions.value.Items[0];

  console.log('selectedItems.value.Description', selectedItem.Description);
  editedItem.value.street = selectedItem.Text
  editedItem.value.addressLine = selectedItem.Description
  editedItem.value.city = selectedItem.Id.split('|')[1]
  editedItem.value.state = selectedItem.Id.split('|')[2]
  editedItem.value.country = selectedItem.Id.split('|')[0]
  editedItem.value.zip = selectedItem.Id.split('|')[3]

}
</script>

<template>
  <v-data-table :headers="headers" :items="address">
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>CRUD</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px" min-height=500 origin="center center">
          <template #activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props">
              New
            </v-btn>
          </template>
          <v-card>
            <v-slide-group show-arrows>
              <v-slide-group-item v-slot="{ isSelected, toggle }" value="one">
                <v-btn class="ma-2" rounded="5px" :color="isSelected ? 'black' : 'grey'" @click="toggle">
                  North America</v-btn>
              </v-slide-group-item>
              <v-slide-group-item v-slot="{ isSelected, toggle }" value="two">
                <v-btn class="ma-2" rounded="5px" :color="isSelected ? 'black' : 'grey'" @click="toggle">
                  Europe</v-btn>
              </v-slide-group-item>
            </v-slide-group>

            <v-card-text>
              <v-window v-model="tab">
                <v-window-item value="one">
                  <form @submit.prevent="save">
                    <v-row>
                      <v-col cols="12">
                        <v-autocomplete base-color="black" v-model:model-value="editedItem.street" v-model:search="editedItem.search" hide-no-data return-object item-value="Id"
                          :items="autocompleteOptions.Items" item-title="Text" title="Text" label="Street name"
                          variant="outlined" @input="searchAddress" @change="setupValues">
                        </v-autocomplete>
                        <v-text-field base-color="black" v-model="editedItem.addressLine" persistent-placeholder placeholder=" "
                          label="Apt, suite, etc" variant="outlined"></v-text-field>
                        <v-text-field base-color="black" v-model="editedItem.city" persistent-placeholder placeholder=" " label="City"
                          variant="outlined"></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-text-field base-color="black" v-model="editedItem.state" persistent-placeholder placeholder=" "
                          label="State / Province" variant="outlined"></v-text-field>

                      </v-col>
                      <v-col>
                        <v-text-field base-color="black" v-model="editedItem.zip" persistent-placeholder placeholder=" "
                          label="ZIP / Postal Code" variant="outlined"></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col>
                        <v-text-field base-color="black"  v-model="editedItem.country" persistent-placeholder placeholder=" " label="Country"
                          variant="outlined"></v-text-field>
                      </v-col>
                    </v-row>
                  </form>
                </v-window-item> 

                <v-window-item value="two">
                  Europe
                </v-window-item>
              </v-window>
            </v-card-text>


            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="close">
                Cancel
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="save">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template #item.actions="{ item }">
      <v-btn class="ma-2" color="gray" @click="editItem(item)" variant="plain">
        Edit
      </v-btn>
      <v-btn class="ma-2" color="gray" @click="deleteItem(item)" variant="plain">
        Delete
      </v-btn>
    </template>
    <template #no-data>
      No address to show
    </template>
  </v-data-table>
</template>
<style scoped>
.v-text-field input {
  border-color: rgba(192, 0, 250, 0.986) !important;
}
</style>
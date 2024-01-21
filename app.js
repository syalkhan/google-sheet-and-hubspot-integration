 var products;
 var sheet;
function getDataFromSheets() {
  const spreadsheetId = '19K0dww3GwNIlj3iXqLSvsL8dav8Hl_vawIet73q_ALA';
  const sheetName = 'Queue';

  try {
    // Get all values from the "Queue" sheet using getDataRange()
     sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    products = sheet.getDataRange().getValues();

    console.log("Getting products from sheets: " + JSON.stringify(products));

    const skuSheetValues = products.map(row => row[0]).slice(1); // Extract column A values and skip the first row
    if ( skuSheetValues.length === 0 ){ 
       showMessageInSheet("No sku", "Please enter sku");
       }
    
    console.log("sku values are : " +JSON.stringify(skuSheetValues));
    
    for (const sku of skuSheetValues) {
      searchProductBySku(sku)
    }


  
  } catch (err) {
    showMessageInSheet("Error", "An error occurred: " + JSON.stringify(err));
    console.log('Error retrieving data:', err.message);
  }

  
}

function searchProductBySku(skuKey) {
 // Getting data for skuKey's row from product array
  var productToSendToHubspot = pickDataBySku(skuKey);
  console.log("current product data after calling pickdataby sku are :" +JSON.stringify(productToSendToHubspot));


  const apiUrl = "https://api.hubapi.com/crm/v3/objects/products/search";
  const apiKey = "Bearer pat-na1-9b829ec6-3f7a-4afa-834e-f978c6451728";

  const headers = {
    "Authorization": apiKey,
    "Content-Type": "application/json"
  };

  const filterData = {
    "filterGroups": [
      {
        "filters": [
          {
            "value": skuKey,
            "propertyName": "hs_sku",
            "operator": "EQ"
          }
        ]
      }
    ]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: headers,
    payload: JSON.stringify(filterData)
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);

    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
       console.log("Search Result:", data.results);
      const productData = data.results;
      
      if (productData.length===0) {
        console.log("calling add product method");
       addproduct(productToSendToHubspot);
      } else {
        console.log("data found in search are :" +JSON.stringify(productData)+ "with id "+productData[0].id);
      const productDataId = productData[0].id;
      console.log("calling update product method");
        updateProduct(productToSendToHubspot, productDataId);
      }


    } else {
      const errorData = JSON.parse(response.getContentText());
      showMessageInSheet("Error", "An error occurred: " + JSON.stringify(errorData));
      throw new Error(`Bad Request: ${response.getResponseCode()}, ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    showMessageInSheet("Error", "An error occurred: " + JSON.stringify(error));
    console.error("Error:", error.message);
  }
  
}

function addproduct(data) {
  var i =1;
  console.log("calling times"+i);
  i++;
  console.log('i am in addproduct function with product data ' +JSON.stringify(data));
    const apiUrl = "https://api.hubapi.com/crm-objects/v1/objects/products";
    const apiKey = "Bearer pat-na1-9b829ec6-3f7a-4afa-834e-f978c6451728";
    let headers = {
      "Authorization": apiKey,
      "Content-Type" : "application/json"
    };
    const productData = [
    {
      "name": "name",
      "value": data[0][1]
    },
    {
      "name": "hs_sku",
      "value" : data[0][0]
    },
    {
      "name": "price",
      "value": data[0][2]
    }
   ];

   const options = {
    method: "post",
      contentType: "application/json",
      headers: headers,
      payload: JSON.stringify(productData)
   };

   try{ 
    const response =  UrlFetchApp.fetch(apiUrl, options);
    if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        console.log("Search Result:", data.results);
        showMessageInSheet("Add product Successfully", "The adding request was successful.");
        // Deleting sheet here
        
        const rangeToClear = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());  // Get the range of the sheet excluding the first row
        rangeToClear.clearContent();  // Clear the content of the specified range
      } else {
        const errorData = JSON.parse(response.getContentText());
        throw new Error(`Bad Request: ${response.getResponseCode()}, ${JSON.stringify(errorData)}`);
      }

   }catch (error) {
    
      console.error("Error:", error.message);
    }

}

function updateProduct(data, productId) {
  console.log('i am in update fucntion with update product : '+JSON.stringify(data));
    
    var apiUrl = "https://api.hubapi.com/crm-objects/v1/objects/products/" + productId;
    console.log(apiUrl);
    const apiKey = "Bearer pat-na1-9b829ec6-3f7a-4afa-834e-f978c6451728";
    let headers = {
      "Authorization": apiKey,
      "Content-Type" : "application/json"
    };
    const productData = [
    {
      "name": "name",
      "value": data[0][1]
    },
    {
      "name": "hs_sku",
      "value" : data[0][0]
    },
    {
      "name": "price",
      "value": data[0][2]
    }
   ];

   const options = {
    method: "put",
      contentType: "application/json",
      headers: headers,
      payload: JSON.stringify(productData)
   };

   try{ 
    const response =  UrlFetchApp.fetch(apiUrl, options);
    if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        console.log("Search Result:", data.results);

       showMessageInSheet("Update Product Successful", "The update request was successful.");
         // Deleting sheet here
        const rangeToClear = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());  // Get the range of the sheet excluding the first row
        rangeToClear.clearContent();  // Clear the content of the specified range

      } else {
        const errorData = JSON.parse(response.getContentText());
        showMessageInSheet("Error", "An error occurred: " + JSON.stringify(errorData));
        throw new Error(`Bad Request: ${response.getResponseCode()}, ${JSON.stringify(errorData)}`);
      }

   }catch (error) {
    showMessageInSheet("Error", "An error occurred: " + JSON.stringify(error));
      console.error("Error:", error.message);
    }

}


// Give sku value and take google sheet row accordingly
function pickDataBySku(targetSku) {
  var result = [];
 console.log("sinlge product length in pickdata function" +JSON.stringify(products.length));
  for (let i = 1; i < products.length; i++) {
    if (products[i][0] === targetSku) {
      result.push(products[i]);
      break;
    }
  }
  console.log("result of picked data " +JSON.stringify(result));
 return result;
}

function showMessageInSheet(title, message) {
  

  // Display a prompt with the provided title and message
  SpreadsheetApp.getActiveSpreadsheet().toast(message, title, 5); 
}

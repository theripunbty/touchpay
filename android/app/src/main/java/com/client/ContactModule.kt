package com.client

import android.Manifest
import android.content.ContentResolver
import android.content.Context
import android.content.pm.PackageManager
import android.provider.ContactsContract
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = ContactModule.NAME)
class ContactModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val NAME = "ContactModule"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun getContacts(promise: Promise) {
        try {
            val context = reactApplicationContext
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS) 
                != PackageManager.PERMISSION_GRANTED) {
                promise.reject("PERMISSION_DENIED", "Read contacts permission not granted")
                return
            }

            val contacts = WritableNativeArray()
            val contentResolver: ContentResolver = context.contentResolver
            val cursor = contentResolver.query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                arrayOf(
                    ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                    ContactsContract.CommonDataKinds.Phone.NUMBER,
                    ContactsContract.CommonDataKinds.Phone.PHOTO_URI
                ),
                null,
                null,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " ASC"
            )

            cursor?.use {
                val nameIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
                val numberIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)
                val photoIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.PHOTO_URI)

                while (it.moveToNext()) {
                    val contact = WritableNativeMap()
                    contact.putString("name", it.getString(nameIndex) ?: "")
                    contact.putString("phone", it.getString(numberIndex) ?: "")
                    contact.putString("photo", it.getString(photoIndex) ?: "")
                    contacts.pushMap(contact)
                }
            }

            promise.resolve(contacts)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error occurred", e)
        }
    }
} 
#import "ContactModule.h"
#import <Contacts/Contacts.h>
#import <React/RCTLog.h>

@implementation ContactModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getContacts:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  CNAuthorizationStatus status = [CNContactStore authorizationStatusForEntityType:CNEntityTypeContacts];
  
  if (status == CNAuthorizationStatusDenied || status == CNAuthorizationStatusRestricted) {
    reject(@"PERMISSION_DENIED", @"Read contacts permission not granted", nil);
    return;
  }
  
  CNContactStore *contactStore = [[CNContactStore alloc] init];
  
  if (status == CNAuthorizationStatusNotDetermined) {
    [contactStore requestAccessForEntityType:CNEntityTypeContacts completionHandler:^(BOOL granted, NSError * _Nullable error) {
      if (!granted) {
        dispatch_async(dispatch_get_main_queue(), ^{
          reject(@"PERMISSION_DENIED", @"Read contacts permission not granted", error);
        });
        return;
      }
      
      [self fetchContactsWithStore:contactStore resolver:resolve rejecter:reject];
    }];
  } else {
    [self fetchContactsWithStore:contactStore resolver:resolve rejecter:reject];
  }
}

- (void)fetchContactsWithStore:(CNContactStore *)contactStore
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject
{
  NSMutableArray *result = [NSMutableArray array];
  
  NSArray *keys = @[
    CNContactGivenNameKey,
    CNContactFamilyNameKey,
    CNContactPhoneNumbersKey,
    CNContactThumbnailImageDataKey,
    CNContactImageDataAvailableKey
  ];
  
  CNContactFetchRequest *fetchRequest = [[CNContactFetchRequest alloc] initWithKeysToFetch:keys];
  
  NSError *fetchError;
  BOOL success = [contactStore enumerateContactsWithFetchRequest:fetchRequest error:&fetchError usingBlock:^(CNContact * _Nonnull contact, BOOL * _Nonnull stop) {
    for (CNLabeledValue *phoneNumber in contact.phoneNumbers) {
      NSMutableDictionary *contactDict = [NSMutableDictionary dictionary];
      
      // Combine given name and family name
      NSString *fullName = [NSString stringWithFormat:@"%@ %@", contact.givenName, contact.familyName];
      fullName = [fullName stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
      
      if ([fullName length] == 0) {
        fullName = @"No Name";
      }
      
      [contactDict setObject:fullName forKey:@"name"];
      
      // Format phone number
      CNPhoneNumber *phoneNumberValue = phoneNumber.value;
      NSString *phoneNumberString = phoneNumberValue.stringValue;
      phoneNumberString = [phoneNumberString stringByReplacingOccurrencesOfString:@"[^0-9]" withString:@"" options:NSRegularExpressionSearch range:NSMakeRange(0, phoneNumberString.length)];
      
      // Keep only the last 10 digits if longer
      if (phoneNumberString.length > 10) {
        phoneNumberString = [phoneNumberString substringFromIndex:phoneNumberString.length - 10];
      }
      
      [contactDict setObject:phoneNumberString forKey:@"phone"];
      
      // Add thumbnail image if available
      if (contact.imageDataAvailable && contact.thumbnailImageData) {
        NSString *photoBase64 = [contact.thumbnailImageData base64EncodedStringWithOptions:0];
        NSString *photoUri = [NSString stringWithFormat:@"data:image/png;base64,%@", photoBase64];
        [contactDict setObject:photoUri forKey:@"photo"];
      } else {
        [contactDict setObject:@"" forKey:@"photo"];
      }
      
      [result addObject:contactDict];
    }
  }];
  
  if (!success) {
    return reject(@"ERROR", @"Failed to fetch contacts", fetchError);
  }
  
  // Remove duplicates by phone number
  NSMutableArray *uniqueContacts = [NSMutableArray array];
  NSMutableSet *seenPhoneNumbers = [NSMutableSet set];
  
  for (NSDictionary *contact in result) {
    NSString *phoneNumber = contact[@"phone"];
    
    if (![seenPhoneNumbers containsObject:phoneNumber]) {
      [seenPhoneNumbers addObject:phoneNumber];
      [uniqueContacts addObject:contact];
    }
  }
  
  resolve(uniqueContacts);
}

@end 
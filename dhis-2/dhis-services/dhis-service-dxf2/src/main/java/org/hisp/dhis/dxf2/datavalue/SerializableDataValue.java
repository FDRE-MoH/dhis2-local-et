package org.hisp.dhis.dxf2.datavalue;

import java.io.Serializable;

public class SerializableDataValue implements Serializable
{
        /**
     * temporary serial version id
     */
    private static final long serialVersionUID = 2387121L;
    public byte[] dataElement;
    public byte[] period;
    public byte[] orgUnit;
    public byte[] categoryOptionCombo;
    public byte[] attributeOptionCombo;
    public byte[] value;
    public byte[] storedBy;
    public byte[] lastUpdated;
    public byte[] comment;
    public boolean followUp;
    //public boolean deleted;

}
